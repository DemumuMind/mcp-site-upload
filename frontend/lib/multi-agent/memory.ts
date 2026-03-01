import type { MemoryRecord, MemoryStore } from "./types";

const DEFAULT_MAX_RECORDS = 128;

export class InMemoryMemoryStore implements MemoryStore {
  private records: MemoryRecord[] = [];

  constructor(private readonly maxRecords: number = DEFAULT_MAX_RECORDS) {}

  append(record: MemoryRecord): void {
    this.records.push(record);
    if (this.records.length > this.maxRecords * 2) {
      this.compact();
    }
  }

  getAll(): MemoryRecord[] {
    return [...this.records];
  }

  compact(): void {
    if (this.records.length <= this.maxRecords) {
      return;
    }
    this.records = this.records.slice(-this.maxRecords);
  }
}

