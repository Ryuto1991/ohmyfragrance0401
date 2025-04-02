# 管理者権限で実行されているか確認
if (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Warning "このスクリプトは管理者権限で実行する必要があります。"
    Break
}

# スクリプトのパスを取得
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$batchPath = Join-Path $scriptPath "run-cleanup.bat"

# タスクの作成
$action = New-ScheduledTaskAction -Execute $batchPath -WorkingDirectory $scriptPath
$trigger = New-ScheduledTaskTrigger -Daily -At 3AM # 毎日午前3時に実行
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -DontStopOnIdleEnd -RestartInterval (New-TimeSpan -Minutes 1) -RestartCount 3

# タスクの登録
Register-ScheduledTask -TaskName "OMF Temp Images Cleanup" -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Description "一時保存された画像ファイルのクリーンアップ"

Write-Host "タスクが正常に登録されました。"
Write-Host "タスク名: OMF Temp Images Cleanup"
Write-Host "実行スケジュール: 毎日午前3時" 