Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

Write-Host "=== HUONG DAN: Click vao cua so VALORANT trong 8 giay! ==="
Write-Host ""
for($i=8; $i -gt 0; $i--){
  Write-Host "  $i giay con lai..."
  Start-Sleep -Seconds 1
}
Write-Host "Dang chup man hinh..."

$sw = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds.Width
$sh = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds.Height
$cx = [int]($sw/2); $cy = [int]($sh/2)
$captW = 400; $captH = 400
$captX = $cx - 200; $captY = $cy - 200

$bmp = New-Object System.Drawing.Bitmap($captW, $captH)
$gfx = [System.Drawing.Graphics]::FromImage($bmp)
$gfx.CopyFromScreen($captX, $captY, 0, 0, [System.Drawing.Size]::new($captW, $captH))

$savePath = Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Path) "game_capture.png"
$bmp.Save($savePath, [System.Drawing.Imaging.ImageFormat]::Png)

$purpleW = 0; $purpleS = 0; $total = 0; $samples = @()
for($y=0; $y -lt $captH; $y+=2){
  for($x=0; $x -lt $captW; $x+=2){
    $p = $bmp.GetPixel($x,$y)
    $r=$p.R; $g=$p.G; $b=$p.B; $total++
    $rf=$r/255.0; $gf=$g/255.0; $bf=$b/255.0
    $mx=[Math]::Max($rf,[Math]::Max($gf,$bf))
    $mn=[Math]::Min($rf,[Math]::Min($gf,$bf))
    $d=$mx-$mn; $h=0; $s=0; $v=$mx
    if($mx -ne 0){$s=$d/$mx}
    if($d -ne 0){
      if($mx -eq $rf){$h=60*(($gf-$bf)/$d)}
      elseif($mx -eq $gf){$h=60*(2+($bf-$rf)/$d)}
      else{$h=60*(4+($rf-$gf)/$d)}
      if($h -lt 0){$h+=360}
    }
    if($h -ge 240 -and $h -le 340 -and ($s*100) -ge 15 -and ($v*100) -ge 15){
      $purpleW++
      if($samples.Count -lt 40){
        $samples += "  ($x,$y) R=$r G=$g B=$b | H=$([Math]::Round($h)) S=$([Math]::Round($s*100)) V=$([Math]::Round($v*100))"
      }
    }
    if($h -ge 270 -and $h -le 310 -and ($s*100) -ge 38 -and ($v*100) -ge 40){$purpleS++}
  }
}
Write-Host "Screen: ${sw}x${sh}"
Write-Host "Total pixels: $total"
Write-Host "Purple WIDE (H240-340): $purpleW"
Write-Host "Purple STRICT (H270-310): $purpleS"
Write-Host ""
Write-Host "Purple-ish samples:"
$samples | ForEach-Object { Write-Host $_ }
Write-Host ""
Write-Host "Image saved: $savePath"
$gfx.Dispose(); $bmp.Dispose()
