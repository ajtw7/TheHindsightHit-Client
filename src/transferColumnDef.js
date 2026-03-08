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
    renderCell: (params) => (
      <button onClick={() => onShowAlternatives(params.row)}>
        Show Alternatives ({(params.row.alternatives || []).length})
      </button>
    ),
  },
];
