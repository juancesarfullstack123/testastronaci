import type { AircraftType } from "@/lib/aircraft";

type SeatMapProps = {
  aircraft: AircraftType;
  highlightSeats?: string[];
};

export function SeatMap({ aircraft, highlightSeats = [] }: SeatMapProps) {
  const highlightSet = new Set(highlightSeats);
  const rows: number[] = [];
  for (let row = aircraft.rowStart; row <= aircraft.rowEnd; row++) {
    if (aircraft.skipRows?.includes(row)) continue;
    rows.push(row);
  }

  return (
    <div className="rounded-box border border-base-300 bg-base-200/50 p-3">
      <div className="mb-3 flex items-center justify-between px-1">
        <span className="text-[11px] font-semibold tracking-widest text-base-content/50">
          FRONT OF AIRCRAFT
        </span>
        <div className="flex items-center gap-3 text-[11px] text-base-content/60">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-[4px] border border-base-content/20 bg-base-100" />
            Available
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-[4px] bg-primary" />
            Voucher seat
          </span>
        </div>
      </div>

      <div className="max-h-[420px] overflow-y-auto pr-1">
        <div className="flex flex-col gap-1">
          {rows.map((row) => (
            <div key={row} className="flex items-center gap-1.5">
              <span className="w-5 shrink-0 text-right text-[10px] tabular-nums text-base-content/40">
                {row}
              </span>
              {aircraft.columns.map((group, groupIndex) => (
                <div key={groupIndex} className="mr-2.5 flex gap-1 last:mr-0">
                  {group.map((letter) => {
                    const seatId = `${row}${letter}`;
                    const isHighlighted = highlightSet.has(seatId);
                    return (
                      <div
                        key={seatId}
                        title={seatId}
                        className={
                          isHighlighted
                            ? "animate-seat-pop flex h-6 w-6 scale-110 items-center justify-center rounded-[5px] bg-primary text-[9px] font-bold text-primary-content ring-2 ring-primary ring-offset-1 ring-offset-base-200"
                            : "flex h-6 w-6 items-center justify-center rounded-[5px] border border-base-300 bg-base-100 text-[9px] font-medium text-base-content/30"
                        }
                      >
                        {isHighlighted ? letter : ""}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
