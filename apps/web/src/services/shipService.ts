/**
 * Ship Service — async facade over mock data.
 * Replace the mock implementation with a remote adapter when Convex is ready.
 */
import * as mock from './mock';
import type {
  Shipment,
  Carrier,
  ShippingException,
  CarrierRate,
  BillOfLading,
} from '@/types/entities';

const delay = (ms = 80) => new Promise((r) => setTimeout(r, ms));

export const shipService = {
  // ── Shipments ───────────────────────────────────────────────────
  async getShipments(): Promise<Shipment[]> {
    await delay();
    return mock.shipments;
  },

  async getShipmentById(id: string): Promise<Shipment | undefined> {
    await delay();
    return mock.shipments.find((s) => s.id === id);
  },

  // ── Carriers ────────────────────────────────────────────────────
  async getCarriers(): Promise<Carrier[]> {
    await delay();
    return mock.carriers;
  },

  // ── Exceptions ──────────────────────────────────────────────────
  async getExceptions(): Promise<ShippingException[]> {
    await delay();
    return mock.shippingExceptions;
  },

  // ── Dashboard ───────────────────────────────────────────────────
  async getKpis(): Promise<typeof mock.shipKpis> {
    await delay();
    return mock.shipKpis;
  },

  async getPipeline(): Promise<{ label: string; count: number }[]> {
    await delay();
    return mock.shipPipeline;
  },

  async getCarrierPerformance(): Promise<{ carrier: string; onTime: number }[]> {
    await delay();
    return mock.carriers.map((c) => ({ carrier: c.name, onTime: c.onTimePercent }));
  },

  async getExceptionsSummary(): Promise<{ id: string; customer: string; type: string; time: string }[]> {
    await delay();
    return mock.shippingExceptions.map((e) => ({
      id: e.shipmentNumber,
      customer: e.customerName,
      type: e.type.charAt(0).toUpperCase() + e.type.slice(1),
      time: formatRelativeTime(e.createdAt),
    }));
  },

  // ── Carrier Rates ──────────────────────────────────────────────
  async getCarrierRates(): Promise<CarrierRate[]> {
    await delay();
    return mock.carrierRates;
  },

  // ── Bill of Lading ─────────────────────────────────────────────
  async getBillOfLading(): Promise<BillOfLading> {
    await delay();
    return mock.sampleBillOfLading;
  },
};

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
