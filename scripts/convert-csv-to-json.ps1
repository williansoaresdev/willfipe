<#
.SYNOPSIS
    Converts assets/csv/veiculos.csv (raw FIPE export) into the static JSON files
    served by the site under data/. Run this manually whenever the CSV is updated.

.EXAMPLE
    powershell -File scripts/convert-csv-to-json.ps1
#>
param(
    [string]$CsvPath = "assets/csv/veiculos.csv",
    [string]$OutDir = "data"
)

$ErrorActionPreference = "Stop"
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

function Write-Json {
    param(
        [Parameter(Mandatory)] $Object,
        [Parameter(Mandatory)][string]$Path,
        [int]$Depth = 10,
        [switch]$ForceArray
    )
    $json = $Object | ConvertTo-Json -Depth $Depth -Compress
    if ($ForceArray -and $json -notmatch '^\s*\[') {
        $json = "[$json]"
    }
    [System.IO.File]::WriteAllText($Path, $json, $utf8NoBom)
}

function ConvertTo-PriceNumber {
    param([string]$Text)
    $clean = $Text -replace 'R\$\s*', ''
    $clean = $clean -replace '\.', ''
    $clean = $clean -replace ',', '.'
    return [double]$clean
}

Write-Host "Reading $CsvPath ..."
$rows = Import-Csv -Path $CsvPath -Encoding utf8
Write-Host "Loaded $($rows.Count) rows"

$referenceMonth = $rows[0].Month

New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
New-Item -ItemType Directory -Force -Path "$OutDir/brands" | Out-Null
New-Item -ItemType Directory -Force -Path "$OutDir/models" | Out-Null

$types = @('CAR', 'MOTORCYCLE', 'TRUCK')
$searchIndex = New-Object System.Collections.Generic.List[object]
$typeMeta = New-Object System.Collections.Generic.List[object]

foreach ($type in $types) {
    $typeRows = $rows | Where-Object { $_.Type -eq $type }
    if ($typeRows.Count -eq 0) { continue }

    New-Item -ItemType Directory -Force -Path "$OutDir/models/$type" | Out-Null

    $brands = [ordered]@{}          # brandCode -> brandName
    $models = [ordered]@{}          # "brandCode|modelCode" -> model info

    foreach ($row in $typeRows) {
        $brandCode = $row.'Brand Code'
        $brandName = $row.'Brand Value'
        if (-not $brands.Contains($brandCode)) {
            $brands[$brandCode] = $brandName
        }

        $modelKey = "$brandCode|$($row.'Model Code')"
        if (-not $models.Contains($modelKey)) {
            $models[$modelKey] = [PSCustomObject]@{
                brandCode = $brandCode
                code      = $row.'Model Code'
                name      = $row.'Model Value'
                years     = New-Object System.Collections.Generic.List[object]
            }
        }

        $yearNum = [int](($row.'Year Code' -split '-')[0])
        $models[$modelKey].years.Add([PSCustomObject]@{
                year     = $yearNum
                fuelType = $row.'Fuel Type'
                fipeCode = $row.'Fipe Code'
                price    = ConvertTo-PriceNumber $row.Price
            })
    }

    $brandList = $brands.GetEnumerator() | ForEach-Object {
        [PSCustomObject]@{ code = $_.Key; name = $_.Value }
    } | Sort-Object name
    Write-Json -Object $brandList -Path "$OutDir/brands/$type.json" -ForceArray

    $modelsByBrand = [ordered]@{}
    foreach ($m in $models.Values) {
        if (-not $modelsByBrand.Contains($m.brandCode)) {
            $modelsByBrand[$m.brandCode] = New-Object System.Collections.Generic.List[object]
        }
        $sortedYears = @($m.years | Sort-Object year -Descending)
        $modelsByBrand[$m.brandCode].Add([PSCustomObject]@{
                code  = $m.code
                name  = $m.name
                years = $sortedYears
            })

        $searchIndex.Add([PSCustomObject]@{
                type      = $type
                brandCode = $m.brandCode
                brandName = $brands[$m.brandCode]
                modelCode = $m.code
                modelName = $m.name
            })
    }

    foreach ($bc in $modelsByBrand.Keys) {
        $modelList = @($modelsByBrand[$bc] | Sort-Object name)
        Write-Json -Object $modelList -Path "$OutDir/models/$type/$bc.json" -ForceArray
    }

    $typeMeta.Add([PSCustomObject]@{
            type       = $type
            brandCount = $brands.Count
            modelCount = $models.Count
            rowCount   = $typeRows.Count
        })

    Write-Host "$type -> $($brands.Count) brands, $($models.Count) models, $($typeRows.Count) rows"
}

$searchIndexSorted = @($searchIndex | Sort-Object brandName, modelName)
Write-Json -Object $searchIndexSorted -Path "$OutDir/search-index.json" -ForceArray

$meta = [PSCustomObject]@{
    generatedAt    = (Get-Date -Format "yyyy-MM-dd")
    referenceMonth = $referenceMonth
    types          = $typeMeta.ToArray()
}
Write-Json -Object $meta -Path "$OutDir/meta.json"

Write-Host "Done. Output written to $OutDir/"
