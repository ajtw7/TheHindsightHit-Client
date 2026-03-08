import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { transferColumnDef } from './transferColumnDef';

describe('transferColumnDef', () => {
  it('returns 8 columns', () => {
    const columns = transferColumnDef(() => {});
    expect(columns).toHaveLength(8);
  });

  it('has the expected field names in order', () => {
    const fields = transferColumnDef(() => {}).map((c) => c.field);
    expect(fields).toEqual([
      'element_in',
      'element_in_cost',
      'element_out',
      'element_out_cost',
      'event',
      'time',
      'entry',
      'alternatives',
    ]);
  });

  it('has the expected header names', () => {
    const headers = transferColumnDef(() => {}).map((c) => c.headerName);
    expect(headers).toContain('Player In');
    expect(headers).toContain('Player Out ');
    expect(headers).toContain('GW');
    expect(headers).toContain('Alternatives');
  });

  describe('alternatives column', () => {
    const altCol = () => transferColumnDef(() => {}).find((c) => c.field === 'alternatives');

    it('is marked as not sortable', () => {
      expect(altCol().sortable).toBe(false);
    });

    it('valueGetter returns the count of alternatives', () => {
      const count = altCol().valueGetter({ value: [1, 2, 3] });
      expect(count).toBe(3);
    });

    it('valueGetter returns 0 when alternatives is undefined', () => {
      expect(altCol().valueGetter({ value: undefined })).toBe(0);
    });

    it('valueGetter returns 0 when alternatives is an empty array', () => {
      expect(altCol().valueGetter({ value: [] })).toBe(0);
    });

    it('renderCell shows the alternatives count in the button label', () => {
      const col = transferColumnDef(() => {});
      const altColumn = col.find((c) => c.field === 'alternatives');
      const row = { alternatives: [{ element: 1 }, { element: 2 }] };

      render(altColumn.renderCell({ row, value: row.alternatives }));
      expect(screen.getByRole('button')).toHaveTextContent('Show Alternatives (2)');
    });

    it('renderCell shows count of 0 when alternatives is empty', () => {
      const col = transferColumnDef(() => {});
      const altColumn = col.find((c) => c.field === 'alternatives');
      const row = { alternatives: [] };

      render(altColumn.renderCell({ row, value: row.alternatives }));
      expect(screen.getByRole('button')).toHaveTextContent('Show Alternatives (0)');
    });

    it('calls onShowAlternatives with the row when the button is clicked', () => {
      const onShowAlternatives = jest.fn();
      const col = transferColumnDef(onShowAlternatives);
      const altColumn = col.find((c) => c.field === 'alternatives');
      const row = { element_in: 'Salah', event: 5, alternatives: [] };

      render(altColumn.renderCell({ row, value: row.alternatives }));
      fireEvent.click(screen.getByRole('button'));

      expect(onShowAlternatives).toHaveBeenCalledTimes(1);
      expect(onShowAlternatives).toHaveBeenCalledWith(row);
    });

    it('passes a fresh callback on each call to transferColumnDef', () => {
      const cb1 = jest.fn();
      const cb2 = jest.fn();
      const col1 = transferColumnDef(cb1).find((c) => c.field === 'alternatives');
      const col2 = transferColumnDef(cb2).find((c) => c.field === 'alternatives');
      const row = { alternatives: [] };

      const { unmount } = render(col1.renderCell({ row, value: [] }));
      fireEvent.click(screen.getByRole('button'));
      unmount();

      render(col2.renderCell({ row, value: [] }));
      fireEvent.click(screen.getByRole('button'));

      expect(cb1).toHaveBeenCalledTimes(1);
      expect(cb2).toHaveBeenCalledTimes(1);
    });
  });
});
