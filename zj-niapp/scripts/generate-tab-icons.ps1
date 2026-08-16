Add-Type -AssemblyName System.Drawing

$outputDirectory = Join-Path $PSScriptRoot "..\src\static\tabbar"
[System.IO.Directory]::CreateDirectory($outputDirectory) | Out-Null

function New-TabIcon {
  param(
    [string]$Name,
    [string]$Kind,
    [bool]$Selected
  )

  $bitmap = [System.Drawing.Bitmap]::new(81, 81)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.Clear([System.Drawing.Color]::Transparent)
  $color = if ($Selected) { [System.Drawing.Color]::FromArgb(24, 26, 32) } else { [System.Drawing.Color]::FromArgb(122, 130, 141) }
  $pen = [System.Drawing.Pen]::new($color, 5)
  $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $brush = [System.Drawing.SolidBrush]::new($color)

  switch ($Kind) {
    "home" {
      $graphics.DrawLines($pen, [System.Drawing.Point[]]@(
        [System.Drawing.Point]::new(15, 39),
        [System.Drawing.Point]::new(40, 17),
        [System.Drawing.Point]::new(66, 39)
      ))
      $graphics.DrawRectangle($pen, 22, 37, 37, 29)
      $graphics.DrawLine($pen, 38, 66, 38, 49)
    }
    "chart" {
      $graphics.DrawLine($pen, 16, 65, 66, 65)
      $graphics.FillRectangle($brush, 19, 43, 10, 22)
      $graphics.FillRectangle($brush, 36, 31, 10, 34)
      $graphics.FillRectangle($brush, 53, 18, 10, 47)
    }
    "publish" {
      if ($Selected) {
        $graphics.FillEllipse($brush, 12, 12, 57, 57)
        $whitePen = [System.Drawing.Pen]::new([System.Drawing.Color]::White, 5)
        $whitePen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
        $whitePen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
        $graphics.DrawLine($whitePen, 27, 40, 54, 40)
        $graphics.DrawLine($whitePen, 40, 27, 40, 54)
        $whitePen.Dispose()
      } else {
        $graphics.DrawEllipse($pen, 12, 12, 57, 57)
        $graphics.DrawLine($pen, 27, 40, 54, 40)
        $graphics.DrawLine($pen, 40, 27, 40, 54)
      }
    }
    "profile" {
      $graphics.DrawEllipse($pen, 29, 14, 24, 24)
      $graphics.DrawArc($pen, 18, 41, 45, 30, 190, 160)
    }
  }

  $fileName = if ($Selected) { "$Name-active.png" } else { "$Name.png" }
  $bitmap.Save((Join-Path $outputDirectory $fileName), [System.Drawing.Imaging.ImageFormat]::Png)
  $brush.Dispose()
  $pen.Dispose()
  $graphics.Dispose()
  $bitmap.Dispose()
}

@(
  @{ Name = "find"; Kind = "home" },
  @{ Name = "market"; Kind = "chart" },
  @{ Name = "publish"; Kind = "publish" },
  @{ Name = "profile"; Kind = "profile" }
) | ForEach-Object {
  New-TabIcon -Name $_.Name -Kind $_.Kind -Selected $false
  New-TabIcon -Name $_.Name -Kind $_.Kind -Selected $true
}

