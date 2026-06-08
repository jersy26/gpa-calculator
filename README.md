# PLM GPA / GWA Calculator

A simple static web app for computing your General Weighted Average (GWA/GPA) using the Pamantasan ng Lungsod ng Maynila (PLM) grading scale.

## Features

- Enter PLM numerical grades (1.00 – 5.00) per subject
- Compute weighted GWA from subjects and credit units
- Support for special statuses: INC, DO, and DU
- No build step or dependencies required

## Usage

1. Open `index.html` in any modern web browser.
2. Add subjects with their credit units.
3. Select a **grade** (1.00 – 5.00, or INC/DO/DU) for each subject.
4. Click **Calculate GWA** to see your result.

## Grading Scale

| Percentage | Rating | Remarks       |
|------------|--------|---------------|
| 98 – 100   | 1.00   | Excellent     |
| 95 – 97    | 1.25   | Excellent     |
| 92 – 94    | 1.50   | Very Good     |
| 89 – 91    | 1.75   | Very Good     |
| 86 – 88    | 2.00   | Good          |
| 83 – 85    | 2.25   | Good          |
| 80 – 82    | 2.50   | Satisfactory  |
| 77 – 79    | 2.75   | Satisfactory  |
| 75 – 76    | 3.00   | Passed        |
| Below 75   | 5.00   | Failed        |

**Special statuses:** INC and DO are excluded from GWA calculation. DU is counted as 5.00.

## GWA Formula

```
GWA = sum(numerical rating × units) / sum(units)
```

Lower GWA means better performance (1.00 is the best).
