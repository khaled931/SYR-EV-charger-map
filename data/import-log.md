# EV Chargers Data Import Log

## Import date
2026-06-30

## Source file
`EV charger location.xlsx`, uploaded by the project owner.

## Sheet used
`Charger`

## Import result

| Item | Result |
|---|---:|
| Rows in source sheet, excluding header | 13 |
| Valid mapped charging locations | 12 |
| Skipped rows | 1 |
| Total charger count from `Charger numbers` | 18 |
| Operators | Electro taxi; SEVRA |
| Covered governorates | Aleppo; Damascus; Hama; Homs; Idlib; Latakia; Rural Damascus |

## Skipped row

| Suggested_ID | Reason |
|---|---|
| `SY-TBD-TBD-FSD-001` | Latitude and longitude are `TBD`, so the row cannot be mapped yet. |

## Data quality notes

- The source sheet does not include connector type, charging power, operational status, source date, or last verification date.
- All imported records are therefore marked as `Unverified` and `status: unknown` until further verification.
- `SY-RD-DAM-JALLAB-001` and `SY-HO-HOM-CLOVER-001` have near-duplicate coordinates and should be checked before public launch.
