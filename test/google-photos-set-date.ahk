#Requires AutoHotkey v2.0
#SingleInstance Force

; thanks gemini

; Initialize global variables
global paramA := ""
global paramB := ""

; Watch the clipboard for changes
OnClipboardChange ClipChanged

ClipChanged(DataType) {
    ; DataType 1 means text was copied
    if (DataType == 1) {
        cliptext := A_Clipboard

        ; Check if the copied text is our specific config string
        if (InStr(cliptext, "AHK_CONFIG|") == 1) {
            ; Split the string by the pipe character
            parts := StrSplit(cliptext, "|")

            if (parts.Length >= 3) {
                global paramA := parts[2]
                global paramB := parts[3]

                ; Show a little Windows notification that it worked
                ; TrayTip("AHK Configured!", "Param A: " paramA "`nParam B: " paramB)
            }
        }
    }
}

; The keybind to trigger your sequence
F1:: {
    if (paramA != "" && paramB != "") {
        Send("{Tab}") ; year -> month
        Send("{Tab}") ; month -> day
        Send("{Tab}") ; day -> hour (should be am)
        ; Sleep(500)
        Send(paramA)
        ; Sleep(50) ; Tiny delay to ensure the system catches up
        ; tab not necessary, google photos will auto advance
        ; Send("{Tab}")
        ; Sleep(50)
        Send(paramB)
        ; Sleep(50)
        Send("{Enter}")
    } else {
        MsgBox("Please click the configuration button on the website first!")
    }
}
