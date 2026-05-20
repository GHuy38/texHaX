Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
Add-Type @"
using System;using System.Runtime.InteropServices;
public class W32{
[DllImport("user32.dll")]public static extern int GetSystemMetrics(int i);
[DllImport("user32.dll")]public static extern int GetWindowLong(IntPtr h,int i);
[DllImport("user32.dll")]public static extern int SetWindowLong(IntPtr h,int i,int v);
}
"@
$sw=[W32]::GetSystemMetrics(0);$sh=[W32]::GetSystemMetrics(1)
$cx=[int]($sw/2);$cy=[int]($sh/2)
$fov=100

$ov=New-Object System.Windows.Forms.Form
$ov.FormBorderStyle='None';$ov.TopMost=$true;$ov.ShowInTaskbar=$false
$ov.BackColor=[System.Drawing.Color]::Lime
$ov.TransparencyKey=[System.Drawing.Color]::Lime
$fs=$fov*2+4;$ov.Size=New-Object System.Drawing.Size($fs,$fs)
$ov.StartPosition='Manual'
$ov.Location=New-Object System.Drawing.Point(($cx-$fov-2),($cy-$fov-2))
$ov.Add_Paint({
$_.Graphics.SmoothingMode='AntiAlias'
$p=New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255,255,0,0),2)
$_.Graphics.DrawEllipse($p,2,2,($fov*2),($fov*2))
$p.Dispose()
})
$ov.Show()
$ex=[W32]::GetWindowLong($ov.Handle,-20)
[W32]::SetWindowLong($ov.Handle,-20,($ex -bor 0x80000 -bor 0x20))|Out-Null

$running=$true
while($running){
[System.Windows.Forms.Application]::DoEvents()
Start-Sleep -Milliseconds 10
}
