import asyncio
import os
import random
from datetime import datetime, timezone

import httpx
from pydantic import BaseModel

BACKEND_API_URL = os.getenv("BACKEND_API_URL", "http://api:8000")
GENERATOR_SERVICE_TOKEN = os.getenv("GENERATOR_SERVICE_TOKEN", "service-token-xyz")
SLEEP_INTERVAL_SECONDS = 5


class ChillerUnit(BaseModel):
    id: int
    name: str
    building_id: int


class TelemetryPayload(BaseModel):
    unit_id: int
    timestamp: datetime
    inlet_temp: float
    outlet_temp: float
    power_kw: float
    flow_rate: float
    cop: float


async def fetch_chiller_units(client: httpx.AsyncClient) -> list[ChillerUnit]:
    response = await client.get(
        f"{BACKEND_API_URL}/chiller_units",
        headers={"X-Service-Token": GENERATOR_SERVICE_TOKEN},
        timeout=10.0,
    )
    response.raise_for_status()
    return [ChillerUnit(**item) for item in response.json()]


def build_payload(unit_id: int) -> TelemetryPayload:
    return TelemetryPayload(
        unit_id=unit_id,
        timestamp=datetime.now(timezone.utc),
        inlet_temp=round(random.uniform(11.0, 14.0), 2),
        outlet_temp=round(random.uniform(6.0, 9.0), 2),
        power_kw=round(random.uniform(12.0, 45.0), 2),
        flow_rate=round(random.uniform(9.0, 18.0), 2),
        cop=round(random.uniform(2.8, 4.6), 2),
    )


async def send_payload(client: httpx.AsyncClient, payload: TelemetryPayload) -> None:
    response = await client.post(
        f"{BACKEND_API_URL}/telemetry/ingest",
        headers={"X-Service-Token": GENERATOR_SERVICE_TOKEN},
        json=payload.model_dump(mode="json"),
        timeout=10.0,
    )
    response.raise_for_status()


async def run() -> None:
    async with httpx.AsyncClient() as client:
        chiller_units: list[ChillerUnit] = []
        unit_index = 0

        while True:
            if not chiller_units:
                try:
                    chiller_units = await fetch_chiller_units(client)
                    unit_index = 0
                except httpx.HTTPError as exc:
                    print(f"[generator] Failed to fetch chiller units: {exc}")
                    await asyncio.sleep(SLEEP_INTERVAL_SECONDS)
                    continue

            current_unit = chiller_units[unit_index % len(chiller_units)]
            payload = build_payload(current_unit.id)

            try:
                await send_payload(client, payload)
                print(
                    f"[generator] Sent telemetry for unit {current_unit.id} at {payload.timestamp.isoformat()}"
                )
            except httpx.HTTPError as exc:
                print(f"[generator] Failed to send telemetry: {exc}")
                chiller_units = []  # force refresh

            unit_index += 1
            await asyncio.sleep(SLEEP_INTERVAL_SECONDS)


def main() -> None:
    try:
        asyncio.run(run())
    except KeyboardInterrupt:
        print("[generator] Shutdown requested, stopping generator")


if __name__ == "__main__":
    main()
