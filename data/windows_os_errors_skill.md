---
name: Windows OS Error Codes & Fixes
description: >
  Comprehensive reference guide for Windows Operating System error codes (1–301)
  compiled from Akmal Taufik's guide. Each entry contains Error Code Number,
  Error Name, Short Explanation, and Fixes Guide. Use this skill to diagnose
  Windows system errors and provide targeted troubleshooting steps.
  When a user mentions a Windows error, search for the exact error name or code,
  provide the explanation, and give actionable fixes. If not found, suggest
  general repair tools (SFC, DISM, CHKDSK, Event Viewer).
---

# Windows Operating System Errors With Fixes

**Compiled from:** Akmal Taufik's Windows Error Guide  
**Format:** `| No. | Error Name | Short Explanation | Fixes Guide |`

---

## Section 1: Errors 1 – 61 (System & File Core)

| No. | Error Name | Short Explanation | Fixes Guide |
|-----|------------|-------------------|-------------|
| 1 | ERROR_SUCCESS | Operation completed successfully | No fix needed |
| 2 | ERROR_INVALID_FUNCTION | Incorrect function called | Check API usage, update drivers |
| 3 | ERROR_FILE_NOT_FOUND | System cannot find file | Verify file path, restore missing file |
| 4 | ERROR_PATH_NOT_FOUND | System cannot find path | Check directory structure, fix shortcuts |
| 5 | ERROR_TOO_MANY_OPEN_FILES | Cannot open more files | Close unused programs, increase file handle limit |
| 6 | ERROR_ACCESS_DENIED | Access is denied | Run as administrator, check permissions |
| 7 | ERROR_INVALID_HANDLE | Handle is invalid | Restart program, reboot system |
| 8 | ERROR_NOT_ENOUGH_MEMORY | Insufficient storage | Close apps, increase RAM or pagefile |
| 9 | ERROR_INVALID_ACCESS | Invalid memory access | Reinstall app, run memory diagnostic |
| 10 | ERROR_INVALID_DRIVE | Drive does not exist | Check drive letter, map network drive |
| 11 | ERROR_NO_MORE_FILES | No more files found | Correct file search pattern |
| 12 | ERROR_BAD_ENVIRONMENT | Environment incorrect | Reset environment variables |
| 13 | ERROR_NOT_SUPPORTED | Request not supported | Update OS or drivers |
| 14 | ERROR_BAD_FORMAT | Invalid program format | Reinstall application |
| 15 | ERROR_INVALID_DRIVE_LEVEL | Drive level invalid | Reboot, run CHKDSK |
| 16 | ERROR_NO_MORE_SEARCH_HANDLES | No more search handles | Close search windows, reboot |
| 17 | ERROR_WRITE_PROTECT | Media is write protected | Disable write protection on drive |
| 18 | ERROR_BAD_UNIT | System cannot find drive | Check connections, update drivers |
| 19 | ERROR_NOT_READY | Drive not ready | Insert media, check drive power |
| 20 | ERROR_BAD_COMMAND | Incorrect command | Verify command syntax |
| 21 | ERROR_CRC | Data error cyclic redundancy check | Run CHKDSK, replace failing drive |
| 22 | ERROR_BAD_LENGTH | Command length incorrect | Update software |
| 23 | ERROR_SEEK | Cannot locate area on drive | Run CHKDSK /F |
| 24 | ERROR_NOT_DOS_DISK | Non-DOS disk in drive | Format disk correctly |
| 25 | ERROR_SECTOR_NOT_FOUND | Sector not found | Run CHKDSK /R, replace drive |
| 26 | ERROR_OUT_OF_PAPER | Printer out of paper | Add paper to printer |
| 27 | ERROR_WRITE_FAULT | Cannot write to device | Check cables, restart device |
| 28 | ERROR_READ_FAULT | Cannot read from device | Clean device, check connections |
| 29 | ERROR_GEN_FAILURE | Device not functioning | Restart device, replace hardware |
| 30 | ERROR_SHARING_VIOLATION | File in use by another process | Close other programs, reboot |
| 31 | ERROR_LOCK_VIOLATION | Lock violation occurred | Wait and retry, reboot |
| 32 | ERROR_WRONG_DISK | Wrong disk in drive | Insert correct disk |
| 33 | ERROR_SHARING_BUFFER_EXCEEDED | Too many shared files | Reduce open shared files, reboot |
| 34 | ERROR_HANDLE_EOF | Reached end of file | Check file integrity |
| 35 | ERROR_HANDLE_DISK_FULL | Disk is full | Delete files, free up space |
| 36 | ERROR_NOT_SUPPORTED | Request not supported | Update OS or drivers |
| 37 | ERROR_REM_NOT_LIST | Remote computer not listening | Check network, restart remote PC |
| 38 | ERROR_DUP_NAME | Duplicate network name | Change computer name |
| 39 | ERROR_BAD_NETPATH | Network path not found | Verify path, check network |
| 40 | ERROR_NETWORK_BUSY | Network is busy | Wait, reduce network load |
| 41 | ERROR_DEV_NOT_EXIST | Device no longer on network | Reconnect device, restart router |
| 42 | ERROR_TOO_MANY_CMDS | Too many network commands | Reboot system |
| 43 | ERROR_ADAP_HDW_ERR | Network adapter hardware error | Reinstall or replace adapter |
| 44 | ERROR_BAD_NET_RESP | Incorrect network response | Check network configuration |
| 45 | ERROR_UNEXP_NET_ERR | Unexpected network error | Reset network stack |
| 46 | ERROR_BAD_REM_ADAP | Remote adapter not functioning | Restart remote device |
| 47 | ERROR_PRINTQ_FULL | Print queue is full | Clear print queue, restart spooler |
| 48 | ERROR_NO_SPOOL_SPACE | Not enough space for print file | Free disk space on system drive |
| 49 | ERROR_PRINT_CANCELLED | Print job cancelled | Resend print job |
| 50 | ERROR_NETNAME_DELETED | Network name deleted | Reconnect network drive |
| 51 | ERROR_NETWORK_ACCESS_DENIED | Network access denied | Check credentials, permissions |
| 52 | ERROR_BAD_DEV_TYPE | Network device type incorrect | Update network drivers |
| 53 | ERROR_BAD_NET_NAME | Network name not found | Verify network name |
| 54 | ERROR_TOO_MANY_NAMES | Too many names on network | Reduce network devices |
| 55 | ERROR_TOO_MANY_SESS | Too many network sessions | Log off unused sessions |
| 56 | ERROR_SHARING_PAUSED | Sharing paused | Resume sharing |
| 57 | ERROR_REQ_NOT_ACCEP | Request not accepted | Retry later |
| 58 | ERROR_REDIR_PAUSED | Redirection paused | Resume redirection |
| 59 | ERROR_FILE_EXISTS | File already exists | Delete or rename existing file |
| 60 | ERROR_CANNOT_MAKE | Cannot create directory | Check permissions, free space |
| 61 | ERROR_FAIL_24 | MS-DOS int 24 failure | Run CHKDSK, replace drive |

---

## Section 2: Errors 62 – 119 (Semaphores, Memory & Executables)

| No. | Error Name | Short Explanation | Fixes Guide |
|-----|------------|-------------------|-------------|
| 62 | ERROR_OUT_OF_STRUCTURES | Storage exhausted | Reboot, increase resources |
| 63 | ERROR_ALREADY_ASSIGNED | Device already assigned | Remove old assignment |
| 64 | ERROR_INVALID_PASSWORD | Password invalid | Enter correct password |
| 65 | ERROR_INVALID_PARAMETER | Parameter incorrect | Check command syntax |
| 66 | ERROR_NET_WRITE_FAULT | Network write fault | Check cables, restart network |
| 67 | ERROR_NO_PROC_SLOTS | No process slots | Reboot system |
| 68 | ERROR_TOO_MANY_SEMAPHORES | Too many semaphores | Reboot, close programs |
| 69 | ERROR_EXCL_SEM_ALREADY_OWNED | Exclusive semaphore owned | Wait and retry, reboot |
| 70 | ERROR_SEM_IS_SET | Semaphore set | Release semaphore, reboot |
| 71 | ERROR_TOO_MANY_SEM_REQUESTS | Too many semaphore requests | Reboot system |
| 72 | ERROR_INVALID_AT_INTERRUPT_TIME | Cannot operate at interrupt time | Update drivers |
| 73 | ERROR_SEM_OWNER_DIED | Semaphore owner died | Restart application |
| 74 | ERROR_SEM_USER_LIMIT | Semaphore limit reached | Log off, reboot |
| 75 | ERROR_DISK_CHANGE | Wrong disk inserted | Insert correct disk |
| 76 | ERROR_DRIVE_LOCKED | Drive locked | Unlock drive, reboot |
| 77 | ERROR_BROKEN_PIPE | Pipe broken | Restart service, reboot |
| 78 | ERROR_OPEN_FAILED | Open operation failed | Check permissions, file exists |
| 79 | ERROR_BUFFER_OVERFLOW | Buffer too small | Increase buffer size |
| 80 | ERROR_DISK_FULL | Disk full | Delete files, expand disk |
| 81 | ERROR_NO_MORE_SEARCH_HANDLES | No more search handles | Close search windows, reboot |
| 82 | ERROR_INVALID_TARGET_HANDLE | Target handle invalid | Restart program |
| 83 | ERROR_INVALID_CATEGORY | Invalid IOCTL category | Update drivers |
| 84 | ERROR_INVALID_VERIFY_SWITCH | Invalid verify switch | Check command syntax |
| 85 | ERROR_BAD_DRIVER_LEVEL | Driver level invalid | Update or reinstall driver |
| 86 | ERROR_CALL_NOT_IMPLEMENTED | Call not implemented | Update OS or software |
| 87 | ERROR_SEM_TIMEOUT | Semaphore timeout expired | Retry operation, reboot |
| 88 | ERROR_INSUFFICIENT_BUFFER | Buffer too small | Increase buffer size |
| 89 | ERROR_INVALID_NAME | Filename too long | Shorten filename |
| 90 | ERROR_MOD_NOT_FOUND | Module not found | Reinstall application |
| 91 | ERROR_PROC_NOT_FOUND | Procedure not found | Update software |
| 92 | ERROR_WAIT_NO_CHILDREN | No child processes | Correct process call |
| 93 | ERROR_CHILD_NOT_COMPLETE | Child process not complete | Wait for completion |
| 94 | ERROR_DIRECT_ACCESS_HANDLE | Invalid direct access handle | Reboot system |
| 95 | ERROR_NEGATIVE_SEEK | Negative seek attempted | Correct code logic |
| 96 | ERROR_SEEK_ON_DEVICE | Cannot seek on device | Use read/write instead |
| 97 | ERROR_DIR_NOT_EMPTY | Directory not empty | Delete files inside directory |
| 98 | ERROR_NOT_LOCKED | File not locked | Lock file first |
| 99 | ERROR_BAD_PATHNAME | Pathname invalid | Use correct path format |
| 100 | ERROR_MAX_THRDS_REACHED | Max threads reached | Close apps, reboot |
| 101 | ERROR_LOCK_FAILED | Lock attempt failed | Retry, reboot |
| 102 | ERROR_BUSY | Resource busy | Wait and retry |
| 103 | ERROR_CANCEL_VIOLATION | Cancel violation | Correct cancel logic |
| 104 | ERROR_ATOMIC_LOCKS_NOT_SUPPORTED | Atomic locks unsupported | Update OS |
| 105 | ERROR_INVALID_SEGMENT_NUMBER | Invalid segment number | Reinstall software |
| 106 | ERROR_INVALID_ORDINAL | Invalid ordinal number | Reinstall DLLs |
| 107 | ERROR_ALREADY_EXISTS | File already exists | Delete or rename |
| 108 | ERROR_INVALID_FLAG_NUMBER | Invalid flag number | Update software |
| 109 | ERROR_SEM_NOT_FOUND | Semaphore not found | Reboot system |
| 110 | ERROR_INVALID_STARTING_CODESEG | Invalid code segment | Reinstall app |
| 111 | ERROR_INVALID_STACKSEG | Invalid stack segment | Update OS |
| 112 | ERROR_INVALID_MODULETYPE | Invalid module type | Reinstall software |
| 113 | ERROR_INVALID_EXE_SIGNATURE | Invalid exe signature | Reinstall app |
| 114 | ERROR_EXE_MARKED_INVALID | Executable marked invalid | Reinstall program |
| 115 | ERROR_BAD_EXE_FORMAT | Bad executable format | Reinstall application |
| 116 | ERROR_ITERATED_DATA_EXCEEDS_64k | Data exceeds 64KB | Recompile program |
| 117 | ERROR_INVALID_MINALLOCSIZE | Invalid min allocation size | Reinstall software |
| 118 | ERROR_DYNLINK_FROM_INVALID_RING | Invalid dynamic link | Update OS |
| 119 | ERROR_IOPL_NOT_ENABLED | IO privilege level not enabled | Change driver settings |

---

## Section 3: Errors 120 – 179 (Disk, Network, Domain & Security)

| No. | Error Name | Short Explanation | Fixes Guide |
|-----|------------|-------------------|-------------|
| 120 | ERROR_INVALID_SEGDPL | Invalid segment DPL | Update OS |
| 121 | ERROR_AUTODATASEG_EXCEEDS_64k | Auto data exceeds 64KB | Recompile app |
| 122 | ERROR_RING2SEG_MUST_BE_MOVABLE | Ring2 segment not movable | Update OS |
| 123 | ERROR_RELOC_CHAIN_XEEDS_SEGLIM | Relocation chain exceeds limit | Reinstall software |
| 124 | ERROR_INFLOOP_IN_RELOC_CHAIN | Infinite relocation loop | Reinstall app |
| 125 | ERROR_ENVVAR_NOT_FOUND | Environment variable missing | Set required variable |
| 126 | ERROR_NOT_CURRENT_CTRY | Country not current | Change regional settings |
| 127 | ERROR_NOT_DOS_DISK | Wrong disk type | Format correctly |
| 128 | ERROR_ALREADY_EXISTS | File exists already | Use unique filename |
| 129 | ERROR_NOT_SAME_DEVICE | Different devices | Copy within same drive |
| 130 | ERROR_NO_SIGNAL_SENT | No signal sent | Retry operation |
| 131 | ERROR_FILENAME_EXCED_RANGE | Filename exceeds range | Shorten filename |
| 132 | ERROR_BAD_PIPE | Bad pipe | Restart service |
| 133 | ERROR_PIPE_BUSY | Pipe busy | Wait and retry |
| 134 | ERROR_NO_DATA | No data available | Check data source |
| 135 | ERROR_PIPE_NOT_CONNECTED | Pipe not connected | Reconnect pipe |
| 136 | ERROR_MORE_DATA | More data available | Increase buffer |
| 137 | ERROR_NO_WORK_DONE | No work done | Retry operation |
| 138 | ERROR_BAD_USERNAME | Bad username | Enter correct username |
| 139 | ERROR_NOT_CONNECTED | Not connected to service | Connect first |
| 140 | ERROR_ALREADY_CONNECTED | Already connected | Disconnect first |
| 141 | ERROR_CONNECTION_REFUSED | Connection refused by target | Check firewall, service running |
| 142 | ERROR_NO_LOGON_SERVERS | No logon servers available | Check network, DC availability |
| 143 | ERROR_BAD_IMPERSONATION_LEVEL | Bad impersonation level | Adjust security settings |
| 144 | ERROR_CANT_OPEN_ANONYMOUS | Cannot open anonymous level | Adjust security policy |
| 145 | ERROR_BAD_VALIDATION_CLASS | Bad validation class | Update OS |
| 146 | ERROR_BAD_TOKEN_TYPE | Bad token type | Correct token usage |
| 147 | ERROR_NO_SECURITY_ON_OBJECT | No security on object | Set security descriptor |
| 148 | ERROR_CANT_ACCESS_DOMAIN_INFO | Cannot access domain info | Check domain connectivity |
| 149 | ERROR_INVALID_SERVER_STATE | Invalid server state | Restart server |
| 150 | ERROR_INVALID_DOMAIN_STATE | Invalid domain state | Check domain controller |
| 151 | ERROR_INVALID_DOMAIN_ROLE | Invalid domain role | Check FSMO roles |
| 152 | ERROR_NO_SUCH_DOMAIN | No such domain exists | Verify domain name |
| 153 | ERROR_DOMAIN_EXISTS | Domain already exists | Use different name |
| 154 | ERROR_DOMAIN_LIMIT_EXCEEDED | Domain limit exceeded | Reduce domains |
| 155 | ERROR_INTERNAL_DB_CORRUPTION | Internal DB corruption | Restore from backup |
| 156 | ERROR_INTERNAL_ERROR | Internal error occurred | Reboot, check logs |
| 157 | ERROR_GENERIC_NOT_MAPPED | Generic access not mapped | Fix security mapping |
| 158 | ERROR_BAD_DESCRIPTOR_FORMAT | Bad security descriptor format | Recreate descriptor |
| 159 | ERROR_NOT_LOGON_PROCESS | Not a logon process | Use correct process |
| 160 | ERROR_LOGON_SESSION_EXISTS | Logon session exists | End existing session |
| 161 | ERROR_NO_SUCH_PACKAGE | No such authentication package | Install package |
| 162 | ERROR_BAD_LOGON_SESSION_STATE | Bad logon session state | Restart session |
| 163 | ERROR_LOGON_SESSION_COLLISION | Logon session collision | Wait and retry |
| 164 | ERROR_INVALID_LOGON_TYPE | Invalid logon type | Use correct logon type |
| 165 | ERROR_CANNOT_IMPERSONATE | Cannot impersonate | Adjust privileges |
| 166 | ERROR_RXACT_INVALID_STATE | Transaction invalid state | Retry transaction |
| 167 | ERROR_RXACT_COMMIT_FAILURE | Transaction commit failed | Check disk space, retry |
| 168 | ERROR_SPECIAL_ACCOUNT | Special account cannot be modified | Use different account |
| 169 | ERROR_SPECIAL_GROUP | Special group cannot be modified | Use different group |
| 170 | ERROR_SPECIAL_USER | Special user cannot be modified | Use different user |
| 171 | ERROR_MEMBERS_PRIMARY_GROUP | Cannot change primary group | Remove from group first |
| 172 | ERROR_TOKEN_ALREADY_IN_USE | Token already in use | Close token, retry |
| 173 | ERROR_NO_SUCH_ALIAS | No such alias | Verify alias name |
| 174 | ERROR_MEMBER_NOT_IN_ALIAS | Member not in alias | Add member first |
| 175 | ERROR_MEMBER_IN_ALIAS | Member already in alias | Remove duplicate |
| 176 | ERROR_ALIAS_EXISTS | Alias already exists | Use different name |
| 177 | ERROR_LOGON_NOT_GRANTED | Logon not granted | Adjust user rights |
| 178 | ERROR_TOO_MANY_SECRETS | Too many secrets | Reduce stored secrets |
| 179 | ERROR_SECRET_TOO_LONG | Secret too long | Shorten secret |

---

## Section 4: Errors 180 – 239 (Database, Encryption, Window Handles & UI)

| No. | Error Name | Short Explanation | Fixes Guide |
|-----|------------|-------------------|-------------|
| 180 | ERROR_INTERNAL_DB_ERROR | Internal database error | Repair database |
| 181 | ERROR_TOO_MANY_CONTEXT_IDS | Too many context IDs | Reduce contexts |
| 182 | ERROR_LOGON_TYPE_NOT_GRANTED | Logon type not granted | Adjust logon rights |
| 183 | ERROR_NT_CROSS_ENCRYPTION_REQUIRED | Cross-encryption required | Enable encryption |
| 184 | ERROR_NO_SUCH_MEMBER | No such member | Verify member name |
| 185 | ERROR_INVALID_MEMBER | Invalid member | Correct member entry |
| 186 | ERROR_TOO_MANY_SIDS | Too many SIDs in token | Reduce group memberships |
| 187 | ERROR_LM_CROSS_ENCRYPTION_REQUIRED | LM cross-encryption required | Enable LM auth |
| 188 | ERROR_NO_INHERITANCE | No inheritance set | Enable inheritance |
| 189 | ERROR_FILE_CORRUPT | File corrupted | Run SFC /SCANNOW |
| 190 | ERROR_DISK_CORRUPT | Disk corrupted | Run CHKDSK /F |
| 191 | ERROR_NO_USER_SESSION_KEY | No user session key | Re-login |
| 192 | ERROR_LICENSE_QUOTA_EXCEEDED | License quota exceeded | Purchase more licenses |
| 193 | ERROR_WRONG_TARGET_NAME | Wrong target name | Correct target name |
| 194 | ERROR_MUTUAL_AUTH_FAILED | Mutual auth failed | Check credentials |
| 195 | ERROR_TIME_SKEW | Time skew detected | Sync time with NTP |
| 196 | ERROR_CURRENT_DOMAIN_NOT_ALLOWED | Current domain not allowed | Switch to allowed domain |
| 197 | ERROR_INVALID_WINDOW_HANDLE | Invalid window handle | Restart application |
| 198 | ERROR_INVALID_MENU_HANDLE | Invalid menu handle | Restart app |
| 199 | ERROR_INVALID_CURSOR_HANDLE | Invalid cursor handle | Restart app |
| 200 | ERROR_INVALID_ACCEL_HANDLE | Invalid accelerator handle | Restart app |
| 201 | ERROR_INVALID_HOOK_HANDLE | Invalid hook handle | Restart app |
| 202 | ERROR_INVALID_DWP_HANDLE | Invalid DWP handle | Restart app |
| 203 | ERROR_TLW_WITH_WSCHILD | TLW with WS_CHILD | Fix window styles |
| 204 | ERROR_CANNOT_FIND_WND_CLASS | Cannot find window class | Register class |
| 205 | ERROR_WINDOW_OF_OTHER_THREAD | Window owned by another thread | Use proper threading |
| 206 | ERROR_HOTKEY_ALREADY_REGISTERED | Hotkey already registered | Use different hotkey |
| 207 | ERROR_CLASS_ALREADY_EXISTS | Class already exists | Use unique class name |
| 208 | ERROR_CLASS_DOES_NOT_EXIST | Class does not exist | Register class first |
| 209 | ERROR_CLASS_HAS_WINDOWS | Class still has windows | Destroy windows first |
| 210 | ERROR_INVALID_INDEX | Invalid index | Check index range |
| 211 | ERROR_INVALID_ICON_HANDLE | Invalid icon handle | Restart app |
| 212 | ERROR_PRIVATE_DIALOG_INDEX | Private dialog index | Avoid private index |
| 213 | ERROR_LISTBOX_ID_NOT_FOUND | Listbox ID not found | Correct control ID |
| 214 | ERROR_NO_WILDCARD_CHARACTERS | No wildcard characters | Use exact match |
| 215 | ERROR_CLIPBOARD_NOT_OPEN | Clipboard not open | Open clipboard first |
| 216 | ERROR_HOTKEY_NOT_REGISTERED | Hotkey not registered | Register hotkey |
| 217 | ERROR_WINDOW_NOT_DIALOG | Window not a dialog | Use dialog function |
| 218 | ERROR_CONTROL_ID_NOT_FOUND | Control ID not found | Verify control ID |
| 219 | ERROR_INVALID_COMBOBOX_MESSAGE | Invalid combobox message | Use correct message |
| 220 | ERROR_WINDOW_NOT_COMBOBOX | Window not combobox | Check control type |
| 221 | ERROR_INVALID_EDIT_HEIGHT | Invalid edit height | Set correct height |
| 222 | ERROR_DC_NOT_FOUND | Device context not found | Create DC first |
| 223 | ERROR_INVALID_HOOK_FILTER | Invalid hook filter | Use valid filter |
| 224 | ERROR_INVALID_FILTER_PROC | Invalid filter procedure | Correct procedure |
| 225 | ERROR_HOOK_NEEDS_HMOD | Hook needs module handle | Provide HMODULE |
| 226 | ERROR_GLOBAL_ONLY_HOOK | Hook must be global | Install globally |
| 227 | ERROR_JOURNAL_HOOK_SET | Journal hook already set | Remove existing hook |
| 228 | ERROR_HOOK_NOT_INSTALLED | Hook not installed | Install hook first |
| 229 | ERROR_INVALID_LB_MESSAGE | Invalid listbox message | Use correct message |
| 230 | ERROR_SETCOUNT_ON_BAD_LB | SetCount on bad listbox | Correct listbox handle |
| 231 | ERROR_LB_WITHOUT_TABSTOPS | Listbox without tabstops | Add tabstops |
| 232 | ERROR_DESTROY_OBJECT_OF_OTHER_THREAD | Destroy object of other thread | Thread-safe cleanup |
| 233 | ERROR_CHILD_WINDOW_MENU | Child window cannot have menu | Remove menu |
| 234 | ERROR_NO_SYSTEM_MENU | No system menu | Add system menu |
| 235 | ERROR_INVALID_MSGBOX_STYLE | Invalid message box style | Correct style |
| 236 | ERROR_INVALID_SPI_VALUE | Invalid SPI value | Correct parameter |
| 237 | ERROR_SCREEN_ALREADY_LOCKED | Screen already locked | Unlock first |
| 238 | ERROR_HWNDS_HAVE_DIFF_PARENT | Windows have different parent | Use same parent |
| 239 | ERROR_NOT_CHILD_WINDOW | Not a child window | Use child window |

---

## Section 5: Errors 240 – 280 (System Resources, Event Log & Registry)

| No. | Error Name | Short Explanation | Fixes Guide |
|-----|------------|-------------------|-------------|
| 240 | ERROR_INVALID_GW_COMMAND | Invalid GW command | Correct command |
| 241 | ERROR_INVALID_THREAD_ID | Invalid thread ID | Use valid thread |
| 242 | ERROR_NON_MDICHILD_WINDOW | Not an MDI child window | Use MDI child |
| 243 | ERROR_POPUP_ALREADY_ACTIVE | Popup already active | Close existing popup |
| 244 | ERROR_NO_SCROLLBARS | No scrollbars | Add scrollbars |
| 245 | ERROR_INVALID_SCROLLBAR_RANGE | Invalid scrollbar range | Set valid range |
| 246 | ERROR_INVALID_SHOWWIN_COMMAND | Invalid ShowWindow command | Correct command |
| 247 | ERROR_NO_SYSTEM_RESOURCES | No system resources | Reboot, close apps |
| 248 | ERROR_NONPAGED_SYSTEM_RESOURCES | Nonpaged resources exhausted | Reboot |
| 249 | ERROR_PAGED_SYSTEM_RESOURCES | Paged resources exhausted | Increase pagefile |
| 250 | ERROR_WORKING_SET_QUOTA | Working set quota exceeded | Reduce memory usage |
| 251 | ERROR_PAGEFILE_QUOTA | Pagefile quota exceeded | Increase pagefile |
| 252 | ERROR_COMMITMENT_LIMIT | Commitment limit reached | Add RAM, increase pagefile |
| 253 | ERROR_MENU_ITEM_NOT_FOUND | Menu item not found | Verify menu ID |
| 254 | ERROR_INVALID_KEYBOARD_HANDLE | Invalid keyboard handle | Restart input |
| 255 | ERROR_HOOK_TYPE_NOT_ALLOWED | Hook type not allowed | Change hook type |
| 256 | ERROR_REQUIRES_INTERACTIVE_WINDOWSTATION | Requires interactive windowstation | Change session |
| 257 | ERROR_TIMEOUT | Timeout occurred | Retry later |
| 258 | ERROR_EVENTLOG_FILE_CORRUPT | Event log file corrupt | Clear event log |
| 259 | ERROR_EVENTLOG_CANT_START | Event log cannot start | Restart Event Log service |
| 260 | ERROR_LOG_FILE_FULL | Log file full | Clear log file |
| 261 | ERROR_DATATYPE_MISMATCH | Datatype mismatch | Convert data types |
| 262 | ERROR_PROFILE_NOT_FOUND | Profile not found | Create profile |
| 263 | ERROR_KEY_VIOLATION | Key violation | Correct key usage |
| 264 | ERROR_CIRCULAR_DEPENDENCY | Circular dependency | Break dependency chain |
| 265 | ERROR_INVALID_NAME | Invalid name | Use valid characters |
| 266 | ERROR_CATALOG_MISMATCH | Catalog mismatch | Update catalogs |
| 267 | ERROR_DRIVER_INTERNAL_ERROR | Driver internal error | Update or reinstall driver |
| 268 | ERROR_KEY_DELETED | Key has been deleted | Recreate key |
| 269 | ERROR_NO_ROOM_IN_EVENTLOG | No room in eventlog | Clear eventlog |
| 270 | ERROR_INVALID_PARAMETER | Invalid parameter (duplicate) | Check function parameters |
| 271 | ERROR_NO_EVENTLOG_SERVICE | No eventlog service | Start Event Log service |
| 272 | ERROR_INVALID_TASK_INDEX | Invalid task index | Correct index |
| 273 | ERROR_TIMEOUT_AND_NO_CANCEL | Timeout with no cancel | Restart operation |
| 274 | ERROR_NO_SUCH_EVENT | No such event | Verify event ID |
| 275 | ERROR_INVALID_EVENT | Invalid event data | Correct event structure |
| 276 | ERROR_EVENT_ALREADY_REGISTERED | Event already registered | Unregister first |
| 277 | ERROR_EVENT_NOT_REGISTERED | Event not registered | Register event |
| 278 | ERROR_EVENT_SET_DELETE_FAILED | Event set delete failed | Retry deletion |
| 279 | ERROR_SEMAPHORE_LIMIT_EXCEEDED | Semaphore limit exceeded | Reduce semaphore usage |
| 280 | ERROR_INSUFFICIENT_LOGON_INFO | Insufficient logon info | Provide credentials |

---

## Section 6: Errors 281 – 301 (Terminal Server, Certificates & Recovery)

| No. | Error Name | Short Explanation | Fixes Guide |
|-----|------------|-------------------|-------------|
| 281 | ERROR_BAD_TERMINAL_SERVER_CONFIG | Bad terminal server config | Reconfigure TS |
| 282 | ERROR_INVALID_TS_SESSION | Invalid TS session | Use valid session |
| 283 | ERROR_CANNOT_CREATE_INSTANCE | Cannot create instance | Close other instances |
| 284 | ERROR_TERMINAL_SERVER_IS_BUSY | Terminal server busy | Wait and retry |
| 285 | ERROR_TERMINAL_SERVER_IS_SHUTDOWN | Terminal server shutting down | Retry later |
| 286 | ERROR_NO_SYSTEM_EVENT_NOTIFICATION | No system event notification | Enable notifications |
| 287 | ERROR_QUOTA_EXCEEDED | Quota exceeded | Increase quota |
| 288 | ERROR_TIMEOUT (duplicate) | Timeout waiting | Increase timeout |
| 289 | ERROR_IMAGE_MACHINE_TYPE_MISMATCH | Machine type mismatch | Reinstall correct architecture |
| 290 | ERROR_NO_RECOVERY_PROGRAM | No recovery program | Install recovery tool |
| 291 | ERROR_RECOVERY_PROGRAM_FAILED | Recovery program failed | Manual recovery needed |
| 292 | ERROR_NO_VALENTINE | No Valentine (obsolete) | Ignore or update |
| 293 | ERROR_SERVER_SHUTDOWN_IN_PROGRESS | Server shutdown in progress | Wait for restart |
| 294 | ERROR_INVALID_CERTIFICATE | Invalid certificate | Reinstall certificate |
| 295 | ERROR_INVALID_CERTIFICATE_HASH | Invalid certificate hash | Get correct cert |
| 296 | ERROR_CERTIFICATE_EXPIRED | Certificate expired | Renew certificate |
| 297 | ERROR_CANNOT_FIND_CERTIFICATE | Cannot find certificate | Install certificate |
| 298 | ERROR_CERTIFICATE_NOT_VALID_FOR_USER | Certificate invalid for user | Get user-specific cert |
| 299 | ERROR_CERTIFICATE_ALREADY_EXISTS | Certificate exists | Use existing cert |
| 300 | ERROR_CERTIFICATE_REVOKED | Certificate revoked | Obtain new certificate |
| 301 | ERROR_CERTIFICATE_MAPPING_NOT_ALLOWED | Certificate mapping not allowed | Enable mapping |

---

## Quick Reference: Common Fixes by Category

### File & Disk Issues
- **CHKDSK**: Run `chkdsk /f` or `chkdsk /r` for disk errors, bad sectors, CRC errors.
- **SFC**: Run `sfc /scannow` for file corruption.
- **DISM**: Run `DISM /Online /Cleanup-Image /RestoreHealth` for system image repair.
- **Space**: Delete files, clear temp folders, expand disk for disk-full errors.

### Memory & Resource Issues
- **Reboot**: Clears handles, semaphores, and releases stuck resources.
- **Pagefile**: Increase virtual memory in System Properties > Advanced > Performance.
- **RAM**: Add physical RAM if commitment limit/working set quota exceeded.
- **Close Apps**: Free up process slots, threads, and system resources.

### Network Issues
- **Reset Stack**: `netsh winsock reset` and `netsh int ip reset`.
- **Restart**: Router, remote PC, and network adapter.
- **Credentials**: Check permissions, re-enter passwords, verify domain connectivity.
- **Firewall**: Ensure target service is running and ports are open.

### Security & Domain Issues
- **Admin Rights**: Run as administrator for access denied errors.
- **Group Policy**: Adjust user rights, logon types, and impersonation levels.
- **Domain**: Verify DC availability, FSMO roles, and domain name.
- **Certificates**: Reinstall, renew, or obtain correct user-specific certificates.

### Driver & Software Issues
- **Update/Reinstall**: Drivers, software, and OS updates for unsupported calls.
- **DLLs**: Reinstall DLLs for invalid ordinal or module not found errors.
- **Compatibility**: Reinstall correct architecture (x86/x64) for machine type mismatch.

### UI & Window Handle Issues
- **Restart App**: Invalid handles (window, menu, cursor, icon, hook, DC) usually require app restart.
- **Threading**: Use proper threading for window ownership and object destruction.
- **Register**: Register window classes, hotkeys, and events before use.
