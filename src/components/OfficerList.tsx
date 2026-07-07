/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Officer } from "../types";
import { User, MapPin, CreditCard, Edit2, Trash2, FileText, Plus, ShieldAlert } from "lucide-react";
import { calculateDuration } from "../utils";

interface OfficerListProps {
  officers: Officer[];
  onSelect: (officer: Officer) => void;
  onEdit: (officer: Officer) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
}

export default function OfficerList({ officers, onSelect, onEdit, onDelete, onAddNew }: OfficerListProps) {
  
  // Calculate total career duration for display
  const renderCareerDuration = (officer: Officer) => {
    let totalYears = 0;
    let totalMonths = 0;
    let totalDays = 0;

    officer.workHistories.forEach(hist => {
      const today = new Date().toISOString().split("T")[0];
      const effectiveEnd = hist.endDate === "current" ? today : hist.endDate;
      const duration = calculateDuration(hist.startDate, effectiveEnd);
      totalYears += duration.years;
      totalMonths += duration.months;
      totalDays += duration.days;
    });

    // Normalize months and days
    if (totalDays >= 30) {
      totalMonths += Math.floor(totalDays / 30);
      totalDays = totalDays % 30;
    }
    if (totalMonths >= 12) {
      totalYears += Math.floor(totalMonths / 12);
      totalMonths = totalMonths % 12;
    }

    return `${totalYears} ปี ${totalMonths} เดือน ${totalDays} วัน`;
  };

  return (
    <div className="space-y-6">
      {/* Stats summary banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-4 rounded-xl border border-emerald-100 flex items-center justify-between">
          <div>
            <p className="text-xs text-emerald-800 font-semibold uppercase tracking-wider">บุคลากรทั้งหมด</p>
            <p className="text-2xl font-bold text-emerald-950 mt-1 font-mono">{officers.length}</p>
          </div>
          <div className="p-2.5 bg-emerald-600 rounded-lg text-white">
            <User className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-teal-50 to-teal-100/50 p-4 rounded-xl border border-teal-100 flex items-center justify-between">
          <div>
            <p className="text-xs text-teal-800 font-semibold uppercase tracking-wider">เบี้ยเลี้ยงรวมรายปี (ประเมิน)</p>
            <p className="text-2xl font-bold text-teal-950 mt-1 font-mono">
              {new Intl.NumberFormat("th-TH").format(
                officers.reduce((acc, curr) => acc + curr.allowanceRate, 0) * 12
              )} <span className="text-xs font-sans font-normal text-slate-500">บาท</span>
            </p>
          </div>
          <div className="p-2.5 bg-teal-600 rounded-lg text-white">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 p-4 rounded-xl border border-indigo-100 flex items-center justify-between">
          <div>
            <p className="text-xs text-indigo-800 font-semibold uppercase tracking-wider">พ.ต.ส. รวมรายปี (ประเมิน)</p>
            <p className="text-2xl font-bold text-indigo-950 mt-1 font-mono">
              {new Intl.NumberFormat("th-TH").format(
                officers.reduce((acc, curr) => acc + curr.ptsRate, 0) * 12
              )} <span className="text-xs font-sans font-normal text-slate-500">บาท</span>
            </p>
          </div>
          <div className="p-2.5 bg-indigo-600 rounded-lg text-white">
            <FileText className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main List */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-800">ทำเนียบบุคลากรเพื่อจัดทำรายงาน</h3>
        <button
          onClick={onAddNew}
          className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm px-4 py-2 rounded-xl transition shadow-md shadow-emerald-700/10 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          เพิ่มบุคลากร
        </button>
      </div>

      {officers.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center max-w-lg mx-auto">
          <div className="bg-slate-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-slate-700">ไม่พบข้อมูลบุคลากรในระบบ</h4>
          <p className="text-sm text-slate-500 mt-2">
            กรุณาเพิ่มบุคลากรคนแรกเพื่อให้สามารถจัดทำรายงานเบี้ยเลี้ยงเหมาจ่าย และ พ.ต.ส. ได้ตามแบบฟอร์มกระทรวงสาธารณสุข
          </p>
          <button
            onClick={onAddNew}
            className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-semibold transition"
          >
            <Plus className="w-4 h-4" />
            เพิ่มบุคลากรคนแรก
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {officers.map(officer => (
            <div
              key={officer.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col justify-between"
            >
              <div className="p-5">
                {/* Info block */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-base font-bold text-slate-900 font-sans">
                      {officer.title} {officer.firstName} {officer.lastName}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">{officer.position}</p>
                  </div>
                  <span className="bg-teal-50 text-teal-800 font-semibold px-2.5 py-1 rounded-lg text-xs border border-teal-100 uppercase">
                    Level GIS: {officer.gisLevel}
                  </span>
                </div>

                {/* Meta details */}
                <div className="space-y-2 mt-4 pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      {officer.workplace} จ.{officer.province}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      อายุราชการสะสม: <strong className="font-semibold text-slate-800">{renderCareerDuration(officer)}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <CreditCard className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="flex flex-wrap gap-x-2">
                      <span>เบี้ยเลี้ยง: <strong className="text-teal-700">{officer.allowanceRate.toLocaleString()}</strong> บาท/เดือน</span>
                      <span className="text-slate-300">|</span>
                      <span>พ.ต.ส.: <strong className="text-indigo-700">{officer.ptsRate.toLocaleString()}</strong> บาท/เดือน</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onEdit(officer)}
                    className="p-1.5 hover:bg-slate-200 text-slate-600 hover:text-slate-800 rounded-lg transition"
                    title="แก้ไขข้อมูล"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(officer.id)}
                    className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition"
                    title="ลบข้อมูล"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => onSelect(officer)}
                  className="inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white font-semibold text-xs px-3.5 py-1.5 rounded-lg transition shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5" />
                  จัดทำและพิมพ์รายงาน
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
