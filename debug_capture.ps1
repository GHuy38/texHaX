Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class D32{
  [DllImport("user32.dll")] public static extern IntPtr GetDC(IntPtr h);
  [DllImport("user32.dll")] public static extern int ReleaseDC(IntPtr h, IntPtr dc);
  [DllImport("gdi32.dll")] public static extern IntPtr CreateCompatibleDC(IntPtr hdc);
  [DllImport("gdi32.dll")] public static extern IntPtr CreateCompatibleBitmap(IntPtr hdc, int w, int h);
  [DllImport("gdi32.dll")] public static extern IntPtr SelectObject(IntPtr hdc, IntPtr obj);
  [DllImport("gdi32.dll")] public static extern bool BitBlt(IntPtr hdcDest, int x1, int y1, int w, int h, IntPtr hdcSrc, int x2, int y2, uint rop);
  [DllImport("gdi32.dll")] public static extern int GetDIBits(IntPtr hdc, IntPtr hbmp, uint start, uint lines, byte[] bits, ref BITMAPINFO bi, uint usage);
  [DllImport("gdi32.dll")] public static extern bool DeleteObject(IntPtr obj);
  [DllImport("gdi32.dll")] public static extern bool DeleteDC(IntPtr hdc);
  [DllImport("user32.dll")] public static extern int GetSystemMetrics(int i);
  [StructLayout(LayoutKind.Sequential)]
  public struct BITMAPINFOHEADER {
    public int biSize, biWidth, biHeight;
    public short biPlanes, biBitCount;
    public int biCompression, biSizeImage, biXPelsPerMeter, biYPelsPerMeter, biClrUsed, biClrImportant;
  }
  [StructLayout(LayoutKind.Sequential)]
  public struct BITMAPINFO {
    public BITMAPINFOHEADER bmiHeader;
    public int bmiColors;
  }
}
"@

$sw=[D32]::GetSystemMetrics(0); $sh=[D32]::GetSystemMetrics(1)
$cx=[int]($sw/2); $cy=[int]($sh/2)
$captW=200; $captH=200
$captX=$cx-100; $captY=$cy-100

Write-Host "Screen: ${sw}x${sh}, Center: ${cx},${cy}"
Write-Host "Capturing ${captW}x${captH} area from ${captX},${captY}..."
Write-Host ""

# Method 1: GDI BitBlt
Write-Host "=== Method 1: GDI BitBlt ==="
$hdcScreen = [D32]::GetDC([IntPtr]::Zero)
$hdcMem = [D32]::CreateCompatibleDC($hdcScreen)
$hBmp = [D32]::CreateCompatibleBitmap($hdcScreen, $captW, $captH)
$hOld = [D32]::SelectObject($hdcMem, $hBmp)
[D32]::BitBlt($hdcMem, 0, 0, $captW, $captH, $hdcScreen, $captX, $captY, 0x00CC0020) | Out-Null

$bi = New-Object D32+BITMAPINFO
$bi.bmiHeader.biSize = 40
$bi.bmiHeader.biWidth = $captW
$bi.bmiHeader.biHeight = -$captH
$bi.bmiHeader.biPlanes = 1
$bi.bmiHeader.biBitCount = 32
$bi.bmiHeader.biCompression = 0
$bufSize = $captW * $captH * 4
$pixels = New-Object byte[] $bufSize
$ret = [D32]::GetDIBits($hdcMem, $hBmp, 0, $captH, $pixels, [ref]$bi, 0)
Write-Host "GetDIBits returned: $ret"

[D32]::SelectObject($hdcMem, $hOld) | Out-Null
[D32]::DeleteObject($hBmp) | Out-Null
[D32]::DeleteDC($hdcMem) | Out-Null
[D32]::ReleaseDC([IntPtr]::Zero, $hdcScreen) | Out-Null

# Check if all pixels are black (capture failed)
$nonBlack = 0; $total = 0; $purpleCount = 0
$sampleColors = @()
for($y=0; $y -lt $captH; $y+=5){
  for($x=0; $x -lt $captW; $x+=5){
    $idx = ($y * $captW + $x) * 4
    $b=$pixels[$idx]; $g=$pixels[$idx+1]; $r=$pixels[$idx+2]
    $total++
    if($r -gt 5 -or $g -gt 5 -or $b -gt 5){$nonBlack++}
    # Check purple HSV
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
    if($h -ge 270 -and $h -le 310 -and ($s*100) -ge 38 -and ($v*100) -ge 40){$purpleCount++}
    if($sampleColors.Count -lt 20 -and ($r -gt 20 -or $g -gt 20 -or $b -gt 20)){
      $sampleColors += "  Pixel(${x},${y}): R=$r G=$g B=$b  H=$([int]$h) S=$([int]($s*100)) V=$([int]($v*100))"
    }
  }
}
Write-Host "Total sampled: $total, Non-black: $nonBlack ($([int]($nonBlack*100/$total))%)"
Write-Host "Purple pixels found: $purpleCount"
Write-Host ""
Write-Host "Sample non-black pixels:"
$sampleColors | ForEach-Object { Write-Host $_ }

# Save captured image
$bmp = New-Object System.Drawing.Bitmap($captW, $captH)
for($y=0; $y -lt $captH; $y++){
  for($x=0; $x -lt $captW; $x++){
    $idx = ($y * $captW + $x) * 4
    $b=$pixels[$idx]; $g=$pixels[$idx+1]; $r=$pixels[$idx+2]
    $bmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($r,$g,$b))
  }
}
$savePath = Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Path) "debug_capture.png"
$bmp.Save($savePath, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Host ""
Write-Host "Saved capture to: $savePath"

# Method 2: .NET CopyFromScreen
Write-Host ""
Write-Host "=== Method 2: .NET CopyFromScreen ==="
$bmp2 = New-Object System.Drawing.Bitmap($captW, $captH)
$gfx = [System.Drawing.Graphics]::FromImage($bmp2)
try{
  $gfx.CopyFromScreen($captX, $captY, 0, 0, [System.Drawing.Size]::new($captW,$captH))
  $nonBlack2 = 0; $purpleCount2 = 0
  for($y=0; $y -lt $captH; $y+=5){
    for($x=0; $x -lt $captW; $x+=5){
      $p = $bmp2.GetPixel($x,$y)
      if($p.R -gt 5 -or $p.G -gt 5 -or $p.B -gt 5){$nonBlack2++}
      $rf=$p.R/255.0; $gf=$p.G/255.0; $bf=$p.B/255.0
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
      if($h -ge 270 -and $h -le 310 -and ($s*100) -ge 38 -and ($v*100) -ge 40){$purpleCount2++}
    }
  }
  Write-Host "Non-black: $nonBlack2, Purple: $purpleCount2"
  $savePath2 = Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Path) "debug_capture2.png"
  $bmp2.Save($savePath2, [System.Drawing.Imaging.ImageFormat]::Png)
  Write-Host "Saved to: $savePath2"
}catch{
  Write-Host "CopyFromScreen failed: $_"
}
$gfx.Dispose(); $bmp2.Dispose()

# Test rzctl mouse
Write-Host ""
Write-Host "=== rzctl.dll test ==="
$rzPath = Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Path) "rzctl.dll"
if(Test-Path $rzPath){
  Write-Host "rzctl.dll found at $rzPath"
}else{
  Write-Host "rzctl.dll NOT FOUND"
}

Write-Host ""
Write-Host "Done! Check debug_capture.png and debug_capture2.png"
