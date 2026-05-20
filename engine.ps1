param([string]$ConfigPath)
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class W32{
  [DllImport("user32.dll")] public static extern short GetAsyncKeyState(int k);
  [DllImport("user32.dll")] public static extern int GetSystemMetrics(int i);
  [DllImport("user32.dll")] public static extern int GetWindowLong(IntPtr h,int i);
  [DllImport("user32.dll")] public static extern int SetWindowLong(IntPtr h,int i,int v);
  [DllImport("user32.dll")] public static extern IntPtr GetDC(IntPtr h);
  [DllImport("user32.dll")] public static extern int ReleaseDC(IntPtr h, IntPtr dc);
  [DllImport("gdi32.dll")] public static extern IntPtr CreateCompatibleDC(IntPtr hdc);
  [DllImport("gdi32.dll")] public static extern IntPtr CreateCompatibleBitmap(IntPtr hdc, int w, int h);
  [DllImport("gdi32.dll")] public static extern IntPtr SelectObject(IntPtr hdc, IntPtr obj);
  [DllImport("gdi32.dll")] public static extern bool BitBlt(IntPtr hdcDest, int x1, int y1, int w, int h, IntPtr hdcSrc, int x2, int y2, uint rop);
  [DllImport("gdi32.dll")] public static extern int GetDIBits(IntPtr hdc, IntPtr hbmp, uint start, uint lines, byte[] bits, ref BITMAPINFO bi, uint usage);
  [DllImport("gdi32.dll")] public static extern bool DeleteObject(IntPtr obj);
  [DllImport("gdi32.dll")] public static extern bool DeleteDC(IntPtr hdc);

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

  [DllImport("rzctl.dll", CallingConvention=CallingConvention.Cdecl)]
  public static extern bool init();
  [DllImport("rzctl.dll", CallingConvention=CallingConvention.Cdecl)]
  public static extern void mouse_move(int x, int y, bool useButtonFlags);

  [StructLayout(LayoutKind.Sequential)]
  public struct INPUT {
    public uint type;
    public MOUSEINPUT mi;
  }
  [StructLayout(LayoutKind.Sequential)]
  public struct MOUSEINPUT {
    public int dx; public int dy; public uint mouseData;
    public uint dwFlags; public uint time; public IntPtr dwExtraInfo;
  }
  [DllImport("user32.dll")] public static extern uint SendInput(uint n, ref INPUT i, int cb);
  public static void FallbackMove(int dx, int dy) {
    INPUT i = new INPUT();
    i.type = 0;
    i.mi.dx = dx; i.mi.dy = dy;
    i.mi.dwFlags = 0x0001;
    SendInput(1, ref i, Marshal.SizeOf(i));
  }
}
"@

# Load config
$cfg = Get-Content $ConfigPath -Raw | ConvertFrom-Json
$sw = [W32]::GetSystemMetrics(0); $sh = [W32]::GetSystemMetrics(1)
$cx = [int]($sw/2); $cy = [int]($sh/2)
$fov = [int]$cfg.aimFov; $smooth = [int]$cfg.smoothing
if($smooth -lt 1){$smooth=1}
$sens = [double]$cfg.sensitivity; $mult = [double]$cfg.aimMultiplier
$offX = [int]$cfg.headOffsetX; $offY = [int]$cfg.headOffsetY
$speed = 4
$sleepMs = 1

# --- Color detection: UCRazer uses dual mode: RGB range OR HSV range ---
# MODE=0 => RGB range, MODE=1 => HSV range
# Default Purple (Tritanopia) color range from UCRazer:
#   RGB: R[70-255], G[0-190], B[120-255]
#   HSV: H[270-310], S[38-100], V[40-100]
$colorMode = 0
$colorRanges = @{
  'purple-tritanopia' = @{Mode=1; Hmin=270; Hmax=310; Smin=38; Smax=100; Vmin=40; Vmax=100; Rmin=70; Rmax=255; Gmin=0; Gmax=190; Bmin=120; Bmax=255}
  'purple'            = @{Mode=1; Hmin=260; Hmax=300; Smin=40; Smax=100; Vmin=35; Vmax=100; Rmin=60; Rmax=200; Gmin=0; Gmax=100; Bmin=100; Bmax=255}
  'red'               = @{Mode=0; Rmin=180; Rmax=255; Gmin=0; Gmax=80; Bmin=0; Bmax=80; Hmin=0; Hmax=15; Smin=60; Smax=100; Vmin=50; Vmax=100}
  'yellow'            = @{Mode=0; Rmin=200; Rmax=255; Gmin=200; Gmax=255; Bmin=0; Bmax=60; Hmin=50; Hmax=65; Smin=60; Smax=100; Vmin=70; Vmax=100}
  'green'             = @{Mode=0; Rmin=0; Rmax=80; Gmin=180; Gmax=255; Bmin=0; Bmax=80; Hmin=100; Hmax=140; Smin=60; Smax=100; Vmin=50; Vmax=100}
  'blue'              = @{Mode=0; Rmin=0; Rmax=80; Gmin=0; Gmax=80; Bmin=180; Bmax=255; Hmin=220; Hmax=250; Smin=60; Smax=100; Vmin=50; Vmax=100}
  'cyan'              = @{Mode=0; Rmin=0; Rmax=80; Gmin=180; Gmax=255; Bmin=180; Bmax=255; Hmin=170; Hmax=200; Smin=50; Smax=100; Vmin=50; Vmax=100}
  'pink'              = @{Mode=0; Rmin=200; Rmax=255; Gmin=0; Gmax=100; Bmin=150; Bmax=255; Hmin=290; Hmax=330; Smin=50; Smax=100; Vmin=50; Vmax=100}
  'orange'            = @{Mode=0; Rmin=200; Rmax=255; Gmin=80; Gmax=180; Bmin=0; Bmax=60; Hmin=15; Hmax=40; Smin=70; Smax=100; Vmin=60; Vmax=100}
}
$ec = $cfg.enemyColor; if(-not $colorRanges.ContainsKey($ec)){$ec='purple-tritanopia'}
$cr = $colorRanges[$ec]

# Key mapping
$keyMap=@{
  'Mouse1'=0x01;'Mouse2'=0x02;'Mouse3'=0x04;'Mouse4'=0x05;'Mouse5'=0x06
  'F1'=0x70;'F2'=0x71;'F3'=0x72;'F4'=0x73;'F5'=0x74;'F6'=0x75;'F7'=0x76
  'F8'=0x77;'F9'=0x78;'F10'=0x79;'F11'=0x7A;'F12'=0x7B
  'Shift'=0x10;'Ctrl'=0x11;'Alt'=0x12;'Space'=0x20;'Tab'=0x09;'CapsLock'=0x14
}
65..90|%{$keyMap[[char]$_]=$_}
48..57|%{$keyMap["$([char]$_)"]=$_}
$ak1=$keyMap[$cfg.aimbotKey1]; if(-not $ak1){$ak1=0x12} # default ALT like UCRazer
$ak2=if($cfg.aimbotKey2 -and $cfg.aimbotKey2 -ne 'None'){$keyMap[$cfg.aimbotKey2]}else{0}
$alwaysOn = $cfg.alwaysOn -eq $true

# Try load rzctl.dll (Razer mouse driver - like UCRazer)
$useRzctl = $false
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$rzctlPath = Join-Path $scriptDir "rzctl.dll"
if(-not (Test-Path $rzctlPath)){
  $rzctlPath2 = Join-Path $scriptDir "UC-Razer\1.LoatDo\rzctl.dll"
  if(Test-Path $rzctlPath2){ Copy-Item $rzctlPath2 $rzctlPath -Force }
}
if(Test-Path $rzctlPath){
  try{
    $useRzctl = [W32]::init()
    if($useRzctl){ Write-Host "[INFO] rzctl.dll loaded - using Razer driver mouse movement" }
  }catch{ $useRzctl = $false }
}
if(-not $useRzctl){ Write-Host "[INFO] Using SendInput fallback for mouse movement" }

# RGB to HSV conversion
function RgbToHsv($r,$g,$b){
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
  return @{H=$h;S=$s*100;V=$v*100}
}

# FOV Overlay
$ov=New-Object System.Windows.Forms.Form
$ov.FormBorderStyle='None';$ov.TopMost=$true;$ov.ShowInTaskbar=$false
$ov.BackColor=[System.Drawing.Color]::Lime
$ov.TransparencyKey=[System.Drawing.Color]::Lime
$fs=$fov*2+4;$ov.Size=New-Object System.Drawing.Size($fs,$fs)
$ov.StartPosition='Manual'
$ov.Location=New-Object System.Drawing.Point(($cx-$fov-2),($cy-$fov-2))
$ov.Add_Paint({
  $_.Graphics.SmoothingMode='AntiAlias'
  $p=New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(80,255,255,255),1.5)
  $_.Graphics.DrawEllipse($p,2,2,($fov*2),($fov*2))
  $p.Dispose()
  $cp=New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(120,255,50,50),1)
  $_.Graphics.DrawLine($cp,($fov-4),($fov+2),($fov+8),($fov+2))
  $_.Graphics.DrawLine($cp,($fov+2),($fov-4),($fov+2),($fov+8))
  $cp.Dispose()
})
$ov.Show()
$exs=[W32]::GetWindowLong($ov.Handle,-20)
[W32]::SetWindowLong($ov.Handle,-20,($exs -bor 0x80000 -bor 0x20))|Out-Null

# Screen capture using .NET CopyFromScreen (GDI BitBlt returns 0 on some systems)
$bmpW=$fov*2; $bmpH=$fov*2
$captX=$cx-$fov; $captY=$cy-$fov
$capBmp = New-Object System.Drawing.Bitmap($bmpW, $bmpH, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$capGfx = [System.Drawing.Graphics]::FromImage($capBmp)
$capSz = New-Object System.Drawing.Size($bmpW, $bmpH)
$rect = New-Object System.Drawing.Rectangle(0, 0, $bmpW, $bmpH)

$running=$true
while($running){
  [System.Windows.Forms.Application]::DoEvents()
  if(([W32]::GetAsyncKeyState(0x1B) -band 0x8000) -ne 0){$running=$false;break}

  $held = $alwaysOn
  if(-not $held){
    $held = ([W32]::GetAsyncKeyState($ak1) -band 0x8000) -ne 0
    if($ak2 -gt 0){$held = $held -or (([W32]::GetAsyncKeyState($ak2) -band 0x8000) -ne 0)}
  }

      # CopyFromScreen capture
      $capGfx.CopyFromScreen($captX, $captY, 0, 0, $capSz)

      # LockBits for fast pixel access
      $bmpData = $capBmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
      $bufSize = [Math]::Abs($bmpData.Stride) * $bmpH
      $pixels = New-Object byte[] $bufSize
      [System.Runtime.InteropServices.Marshal]::Copy($bmpData.Scan0, $pixels, 0, $bufSize)
      $stride = $bmpData.Stride
      $capBmp.UnlockBits($bmpData)

      # Algorithm from teste-aim-color-master:
      # OpenCV HSV range: LOWER=[140,120,180], UPPER=[160,200,255]
      # OpenCV H is 0-179 (multiply by 2 for standard 360). S, V are 0-255.
      # So standard range: H=[280-320], S=[47%-78%], V=[70%-100%]
      $minH=280; $maxH=320; $minS=47; $maxS=80; $minV=70; $maxV=100
      
      $sumX = 0; $sumY = 0; $count = 0
      $minY = 9999; $maxY = -1
      
      $step = 2 # Speed up scanning
      for($py=0; $py -lt $bmpH; $py+=$step){
        for($px=0; $px -lt $bmpW; $px+=$step){
          $ddx = $px - $fov; $ddy = $py - $fov
          if(($ddx*$ddx + $ddy*$ddy) -gt ($fov*$fov)){continue}

          $idx = $py * $stride + $px * 4
          $b = $pixels[$idx]; $g = $pixels[$idx+1]; $r = $pixels[$idx+2]

          # HSV Conversion (Standard)
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
          
          # Match Tritanopia Purple Enemy
          if($h -ge $minH -and $h -le $maxH -and ($s*100) -ge $minS -and ($s*100) -le $maxS -and ($v*100) -ge $minV -and ($v*100) -le $maxV){
            $sumX += $px; $sumY += $py; $count++
            if($py -lt $minY){$minY = $py}
            if($py -gt $maxY){$maxY = $py}
          }
        }
      }

      # Move mouse if target blob found
      if($count -gt 5){ # Filter noise
        # Find center of the blob
        $cX = [int]($sumX / $count)
        $cY = [int]($sumY / $count)
        
        # Apply Y offset based on blob height (teste-aim-color uses h * 0.3)
        $blobH = $maxY - $minY
        $y_offset = [int]($blobH * 0.3)
        $targetY = $minY + $y_offset # Aim closer to the head/neck

        $dx = ($cX - $fov + $offX)
        $dy = ($targetY - $fov - $offY)

        # Smooth filter history calculation
        $moveSpeed = 2.0 / (5.0 * $sens) # Algorithm from master
        $rawX = $dx * $moveSpeed
        $rawY = $dy * $moveSpeed
        
        $mx = [int]($rawX / ($smooth * 0.5))
        $my = [int]($rawY / ($smooth * 0.5))

        if([Math]::Abs($mx) -gt 0 -or [Math]::Abs($my) -gt 0){
          if($useRzctl){
            [W32]::mouse_move($mx, $my, $false)
          }else{
            [W32]::FallbackMove($mx, $my)
          }
        }
      }
    }catch{}
  }
  Start-Sleep -Milliseconds $sleepMs
}
$capGfx.Dispose(); $capBmp.Dispose()
$ov.Close()
