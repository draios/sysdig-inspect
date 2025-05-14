import React from 'react';

interface CaptureDataTableProps {
  data: any;
  onSelect: (selection: any) => void;
  onDrillDown: (drilldownInfo: any) => void;
}

const CaptureDataTable: React.FC<CaptureDataTableProps> = ({
  data,
  onSelect,
  onDrillDown,
}) => {
  // This is a placeholder component
  if (!data || !data.slices || data.slices.length === 0) {
    return <div className="wsd-capture-data-table__empty">No data available</div>;
  }

  const columns = data.slices[0].columns || [];
  const rows = data.slices[0].data || [];

  return (
    <div className="wsd-capture-data-table">
      <table className="sd-table">
        <thead>
          <tr>
            {columns.map((column: any, index: number) => (
              <th key={index} className="sd-table__header-cell">
                {column.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row: any, rowIndex: number) => (
            <tr 
              key={rowIndex} 
              className="sd-table__row"
              onClick={() => onSelect(row)}
              onDoubleClick={() => onDrillDown({ row, rowIndex })}
            >
              {row.map((cell: any, cellIndex: number) => (
                <td key={cellIndex} className="sd-table__cell">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CaptureDataTable;
