param([string]$ConfigPath)
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
Add-Type @"
using System;using System.Runtime.InteropServices;
public class W32{
[DllImport("user32.dll")]public static extern short GetAsyncKeyState(int k);
[DllImport("user32.dll")]public static extern void mouse_event(uint f,int dx,int dy,uint d,int e);
[DllImport("user32.dll")]public static extern int GetSystemMetrics(int i);
[DllImport("user32.dll")]public static extern int GetWindowLong(IntPtr h,int i);
[DllImport("user32.dll")]public static extern int SetWindowLong(IntPtr h,int i,int v);
}
"@
$cfg=Get-Content $ConfigPath -Raw|ConvertFrom-Json
$sw=[W32]::GetSystemMetrics(0);$sh=[W32]::GetSystemMetrics(1)
$cx=[int]($sw/2);$cy=[int]($sh/2)
$fov=[int]$cfg.aimFov;$smooth=[int]$cfg.smoothing
$sens=[double]$cfg.sensitivity;$mult=[double]$cfg.aimMultiplier
$offX=[int]$cfg.headOffsetX;$offY=[int]$cfg.headOffsetY
$colors=@{
'purple-tritanopia'=@{R=148;G=0;B=211;T=65}
'purple'=@{R=128;G=0;B=200;T=60}
'red'=@{R=255;G=30;B=30;T=55}
'yellow'=@{R=255;G=240;B=0;T=55}
'green'=@{R=0;G=230;B=0;T=55}
'blue'=@{R=30;G=30;B=255;T=55}
'cyan'=@{R=0;G=220;B=220;T=55}
'pink'=@{R=255;G=20;B=180;T=55}
'orange'=@{R=255;G=130;B=0;T=55}
}
$ec=$cfg.enemyColor;if(-not $colors.ContainsKey($ec)){$ec='purple-tritanopia'}
$tgt=$colors[$ec]
$keyMap=@{
'Mouse1'=0x01;'Mouse2'=0x02;'Mouse3'=0x04;'Mouse4'=0x05;'Mouse5'=0x06
'F1'=0x70;'F2'=0x71;'F3'=0x72;'F4'=0x73;'F5'=0x74;'F6'=0x75;'F7'=0x76
'F8'=0x77;'F9'=0x78;'F10'=0x79;'F11'=0x7A;'F12'=0x7B
'Shift'=0x10;'Ctrl'=0x11;'Alt'=0x12;'Space'=0x20;'Tab'=0x09;'CapsLock'=0x14
}
65..90|%{$keyMap[[char]$_]=$_}
48..57|%{$keyMap["$([char]$_)"]=$_}
$ak1=$keyMap[$cfg.aimbotKey1];if(-not $ak1){$ak1=0x02}
$ak2=if($cfg.aimbotKey2 -and $cfg.aimbotKey2 -ne 'None'){$keyMap[$cfg.aimbotKey2]}else{0}
$alwaysOn = $cfg.alwaysOn -eq $true
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
# Make click-through
$ex=[W32]::GetWindowLong($ov.Handle,-20)
[W32]::SetWindowLong($ov.Handle,-20,($ex -bor 0x80000 -bor 0x20))|Out-Null
# Main loop
$bmpW=$fov*2;$bmpH=$fov*2
$bmp=New-Object System.Drawing.Bitmap($bmpW,$bmpH)
$gfx=[System.Drawing.Graphics]::FromImage($bmp)
$sz=New-Object System.Drawing.Size($bmpW,$bmpH)
$running=$true
while($running){
[System.Windows.Forms.Application]::DoEvents()
if(([W32]::GetAsyncKeyState(0x1B) -band 0x8000) -ne 0 -or ([W32]::GetAsyncKeyState(0x74) -band 0x8000) -ne 0){$running=$false;break}

$held = $alwaysOn
if(-not $held){
  $held = ([W32]::GetAsyncKeyState($ak1) -band 0x8000) -ne 0
  if($ak2 -gt 0){$held = $held -or (([W32]::GetAsyncKeyState($ak2) -band 0x8000) -ne 0)}
}

if($held){
try{
$gfx.CopyFromScreen(($cx-$fov),($cy-$fov),0,0,$sz)
$bestD=99999;$bx=-1;$by=-1
for($py=0;$py -lt $bmpH;$py+=3){
for($px=0;$px -lt $bmpW;$px+=3){
$pixel=$bmp.GetPixel($px,$py)
$dr=$pixel.R-$tgt.R;$dg=$pixel.G-$tgt.G;$db=$pixel.B-$tgt.B
$cd=[Math]::Sqrt($dr*$dr+$dg*$dg+$db*$db)
if($cd -lt $tgt.T){
$ddx=$px-$fov;$ddy=$py-$fov
$d=[Math]::Sqrt($ddx*$ddx+$ddy*$ddy)
if($d -lt $bestD){$bestD=$d;$bx=$px;$by=$py}
}}}
if($bx -ge 0){
$dx=($bx-$fov+$offX)*$sens*$mult
$dy=($by-$fov-$offY)*$sens*$mult
$mx=[int]($dx/$smooth);$my=[int]($dy/$smooth)
$mx+=[int]((Get-Random -Min -1 -Max 2))
$my+=[int]((Get-Random -Min -1 -Max 2))
if([Math]::Abs($mx) -gt 0 -or [Math]::Abs($my) -gt 0){
[W32]::mouse_event(0x0001,$mx,$my,0,0)
}}
}catch{}
}
Start-Sleep -Milliseconds 10
}
$gfx.Dispose();$bmp.Dispose();$ov.Close()
