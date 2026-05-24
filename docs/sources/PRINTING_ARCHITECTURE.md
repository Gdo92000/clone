---
type: source
status: active
created_at: 2026-05-23
updated_at: 2026-05-23
tags:
 - type/source
---

> [!tip] Navegação
> ← [[MOC Addons]] · [[kitchen-auto-print-addon]]

# Printing Architecture - Kitchen Auto-Print Addon
 
## Overview
The `kitchen_auto_print` addon provides a decoupled, asynchronous printing system that automatically triggers thermal print jobs when a merchant accepts an order.
 
## Technical Flow
1. **Trigger**: Order status changes to `accepted` via `POST /api/orders/:id/status`.
2. **Enqueuing**: `PrintingService.enqueuePrintJob` creates a `print_jobs` entry with status `pending`.
3. **Async Processing**: A background process (invoked immediately but running asynchronously) resolves the printer configuration for the branch.
4. **Driver Selection**: Based on `printer_type` (network, usb, bluetooth), the system instantiates the corresponding `PrinterDriver`.
5. **Execution**: The driver sends the ESC/POS payload to the hardware.
6. **State Tracking**: The job moves through `sent` $\rightarrow$ `completed` or `failed`.
 
## Resilience & Idempotency
- **Idempotency**: The system uses the `order_id` as a unique key to ensure a specific order status change only triggers one print job per state transition.
- **Retries**: Failed jobs are automatically retried using an exponential backoff strategy (max 3 retries).
- **Isolation**: All printing logic is wrapped in try-catch blocks to ensure that a printer failure never blocks the main order acceptance flow.
 
## Driver Specification
Current implementation supports:
- **Network Driver**: TCP/IP communication on port 9100 (default) using raw ESC/POS bytes.
- **Extensibility**: New drivers (USB/Bluetooth) can be added by implementing the `PrinterDriver` interface.
 
## Observability
All events are logged in JSON format:
- `PrintingService.processJob` logs every state transition.
- `print_jobs` table provides a full audit trail of every print attempt, error messages, and timestamps.
 
## Deployment Requirements
- **PostgreSQL**: Extensions `cube` and `earthdistance` (if geo-queries are used).
- **Environment**: The server must have network reachability to the local IP addresses of the thermal printers.
