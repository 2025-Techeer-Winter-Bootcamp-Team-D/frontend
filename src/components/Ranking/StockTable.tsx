import React from "react";
import type { Stock } from "../../types";

interface Props {
  stocks: Stock[];
}

const StockTable: React.FC<Props> = ({ stocks }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
        <h3 className="font-bold text-lg text-slate-900">
          필터링 결과{" "}
          <span className="text-[#0046FF] ml-1">({stocks.length})</span>
        </h3>
      </div>
      <div className="overflow-x-auto max-h-[500px]">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-slate-500 z-10">
            <tr>
              <th className="px-4 py-3 font-semibold">기업명</th>
              <th className="px-4 py-3 font-semibold text-center">PER</th>
              <th className="px-4 py-3 font-semibold text-center">PBR</th>
              <th className="px-4 py-3 font-semibold text-center">ROE</th>
              <th className="px-4 py-3 font-semibold text-center">부채</th>
              <th className="px-4 py-3 font-semibold text-center">배당</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {stocks.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-12 text-center text-slate-400 italic"
                >
                  조건을 만족하는 기업이 없습니다.
                </td>
              </tr>
            ) : (
              stocks.map((stock) => (
                <tr
                  key={stock.id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900">{stock.name}</div>
                    <div className="text-[10px] text-slate-400 uppercase">
                      {stock.sector}
                    </div>
                  </td>
                  <td
                    className={`px-4 py-3 text-center font-mono ${stock.per < 10 ? "text-emerald-600 font-bold" : "text-slate-600"}`}
                  >
                    {stock.per.toFixed(1)}
                  </td>
                  <td
                    className={`px-4 py-3 text-center font-mono ${stock.pbr < 1 ? "text-emerald-600 font-bold" : "text-slate-600"}`}
                  >
                    {stock.pbr.toFixed(1)}
                  </td>
                  <td
                    className={`px-4 py-3 text-center font-mono ${stock.roe > 15 ? "text-[#0046FF] font-bold" : "text-slate-600"}`}
                  >
                    {stock.roe.toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 text-center font-mono text-slate-600">
                    {stock.debtRatio.toFixed(0)}%
                  </td>
                  <td className="px-4 py-3 text-center font-mono text-orange-600 font-medium">
                    {stock.divYield.toFixed(1)}%
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockTable;
