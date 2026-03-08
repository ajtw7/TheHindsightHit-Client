export const transferColumnDef = (onShowAlternatives) => [
  {
    field: 'element_in',
    headerName: 'Player In',
    width: 150,
    flex: 1,
    align: 'center',
    headerAlign: 'center',
  },
  {
    field: 'element_in_cost',
    headerName: 'Player In Cost',
    width: 150,
    flex: 1,
    align: 'center',
    headerAlign: 'center',
  },
  {
    field: 'element_out',
    headerName: 'Player Out ',
    width: 150,
    flex: 1,
    align: 'center',
    headerAlign: 'center',
  },
  {
    field: 'element_out_cost',
    headerName: 'Player Out Cost',
    width: 150,
    flex: 1,
    align: 'center',
    headerAlign: 'center',
  },

  {
    field: 'event',
    headerName: 'GW',
    width: 100,
    flex: 1,
    align: 'center',
    headerAlign: 'center',
  },
  {
    field: 'time',
    headerName: 'Time',
    width: 150,
    flex: 1,
    align: 'center',
    headerAlign: 'center',
  },

  {
    field: 'entry',
    headerName: 'Entry',
    width: 150,
    flex: 1,
    align: 'center',
    headerAlign: 'center',
  },
  {
    field: 'alternatives',
    headerName: 'Alternatives',
    width: 180,
    flex: 1,
    align: 'center',
    headerAlign: 'center',
    sortable: false,
    valueGetter: (params) => (params.value || []).length,
    renderCell: (params) => {
      const count = (params.row.alternatives || []).length;
      return (
        <button
          onClick={() => onShowAlternatives(params.row)}
          style={{
            backgroundColor: count > 0 ? '#10b981' : '#334155',
            color: count > 0 ? '#0f172a' : '#94a3b8',
            border: 'none',
            borderRadius: '8px',
            padding: '5px 10px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          Show Alternatives ({count})
        </button>
      );
    },
  },
];
