/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Officer, MonthlyReport } from "../types";
import { THAI_MONTHS, bahtText, formatNumber, calculateDuration, getLastDayOfMonth, toThaiDigits } from "../utils";
import { Printer, Calendar, Settings, Sliders, Undo2, CreditCard, Check, Sparkles } from "lucide-react";

interface ReportPreviewProps {
  officer: Officer;
  onBack: () => void;
}

export default function ReportPreview({ officer, onBack }: ReportPreviewProps) {
  // Report configurations with defaults
  const currentYearCE = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // 1-12
  const defaultYearBE = currentYearCE + 543;

  const [selectedMonth, setSelectedMonth] = useState<number>(9); // Default to Sept as in sample
  const [selectedYearBE, setSelectedYearBE] = useState<number>(2569); // Default to 2569 as in sample
  const [documentDateStr, setDocumentDateStr] = useState<string>("");

  // Print controls
  const [useThaiNumerals, setUseThaiNumerals] = useState<boolean>(false);
  const [activeFormTab, setActiveFormTab] = useState<"all" | "allowance" | "pts">("all");

  // Editable fields within the form (pre-filled from officer but editable directly on screen)
  const [title, setTitle] = useState(officer.title);
  const [firstName, setFirstName] = useState(officer.firstName);
  const [lastName, setLastName] = useState(officer.lastName);
  const [position, setPosition] = useState(officer.position);
  const [workplace, setWorkplace] = useState(officer.workplace);
  const [province, setProvince] = useState(officer.province);
  const [gisLevel, setGisLevel] = useState(officer.gisLevel);

  // Address
  const [houseNo, setHouseNo] = useState(officer.address.houseNo);
  const [moo, setMoo] = useState(officer.address.moo);
  const [subdistrict, setSubdistrict] = useState(officer.address.subdistrict);
  const [district, setDistrict] = useState(officer.address.district);
  const [addressProvince, setAddressProvince] = useState(officer.address.province);

  // Rates
  const [allowanceRate, setAllowanceRate] = useState<number>(officer.allowanceRate);
  const [ptsRate, setPtsRate] = useState<number>(officer.ptsRate);

  // Payers
  const [fundSourceAllowance, setFundSourceAllowance] = useState(officer.fundSourceAllowance);
  const [fundSourcePts, setFundSourcePts] = useState(officer.fundSourcePts);

  // Overridden service period calculations
  const [overrideServiceTime, setOverrideServiceTime] = useState<boolean>(false);
  const [customYears, setCustomYears] = useState<number>(22);
  const [customMonths, setCustomMonths] = useState<number>(3);
  const [customDays, setCustomDays] = useState<number>(0);

  // Auto-calculation of service period up to the last day of the selected month
  const [autoYears, setAutoYears] = useState<number>(0);
  const [autoMonths, setAutoMonths] = useState<number>(0);
  const [autoDays, setAutoDays] = useState<number>(0);

  // Set default document date to the last day of the selected month
  useEffect(() => {
    const lastDayDate = getLastDayOfMonth(selectedMonth, selectedYearBE);
    setDocumentDateStr(lastDayDate);
  }, [selectedMonth, selectedYearBE]);

  // Re-calculate the automatic duration whenever month, year or officer history changes
  useEffect(() => {
    if (officer.workHistories && officer.workHistories.length > 0) {
      // Find the primary or longest active history, or accumulate.
      // Usually we calculate from the earliest start date to the end of the selected month.
      const startDates = officer.workHistories.map(h => new Date(h.startDate).getTime());
      const earliestStart = new Date(Math.min(...startDates));
      
      const lastDayStr = getLastDayOfMonth(selectedMonth, selectedYearBE);
      const end = new Date(lastDayStr);

      const duration = calculateDuration(earliestStart.toISOString().split("T")[0], lastDayStr);
      setAutoYears(duration.years);
      setAutoMonths(duration.months);
      setAutoDays(duration.days);

      // If not overridden, update custom inputs
      if (!overrideServiceTime) {
        setCustomYears(duration.years);
        setCustomMonths(duration.months);
        setCustomDays(duration.days);
      }
    }
  }, [selectedMonth, selectedYearBE, officer.workHistories, overrideServiceTime]);

  const handlePrint = () => {
    window.print();
  };

  const formattedMonth = THAI_MONTHS[selectedMonth];
  const formattedYear = selectedYearBE.toString();

  // Address text builder
  const addressText = `บ้านเลขที่ ${houseNo} หมู่ที่ ${moo} ตำบล${subdistrict} อำเภอ${district} จังหวัด${addressProvince}`;

  // Helper to format string numbers inside templates based on numeral selection
  const num = (val: string | number) => {
    const formatted = val.toString();
    return useThaiNumerals ? toThaiDigits(formatted) : formatted;
  };

  const getDayOfDocDate = () => {
    if (!documentDateStr) return "";
    return documentDateStr.split("-")[2];
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Dynamic Styling for printing */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600;1,700;1,800&display=swap');

        /* Force TH Sarabun PSK and Sarabun for the entire document preview and print */
        .print-page, .print-page * {
          font-family: "TH Sarabun PSK", "TH Sarabun New", "Sarabun", "Sarabun New", sans-serif !important;
          color: #000000 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          box-sizing: border-box !important;
        }

        /* Web / Screen Styling */
        @media screen {
          .print-page {
            width: 210mm !important;
            height: 297mm !important;
            min-height: 297mm !important;
            max-height: 297mm !important;
            padding: 2.2cm 2cm 1.8cm 2.8cm !important; /* Left 2.8cm, Top 2.2cm, Right 2cm, Bottom 1.8cm */
            background: white !important;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1) !important;
            border: 1px solid #e2e8f0 !important;
            border-radius: 4px !important;
            position: relative !important;
            overflow: hidden !important;
            margin: 0 auto !important;
          }
        }

        /* Print / PDF Styling */
        @media print {
          @page {
            size: A4 portrait;
            margin: 0 !important; /* using padding inside print-page instead */
          }
          body {
            background: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          .print-container {
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            background: transparent !important;
            display: block !important;
          }
          .print-page {
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            margin: 0 !important;
            padding: 2.2cm 2cm 1.8cm 2.8cm !important; /* Left 2.8cm, Top 2.2cm, Right 2cm, Bottom 1.8cm */
            page-break-after: always !important;
            page-break-inside: avoid !important;
            width: 210mm !important;
            height: 297mm !important;
            min-height: 297mm !important;
            max-height: 297mm !important;
            background: white !important;
            position: relative !important;
            overflow: hidden !important;
          }
        }

        /* Document table alignments and borders for pure black print */
        .print-page table {
          border-collapse: collapse !important;
          width: 100% !important;
        }
        .print-page th, .print-page td {
          border: 1px solid #000000 !important;
          color: #000000 !important;
        }
        .print-page .border-dotted {
          border-bottom-style: dotted !important;
          border-bottom-color: #000000 !important;
          border-bottom-width: 0.75px !important;
        }
        .print-page .border-b {
          border-bottom-style: dotted !important;
          border-bottom-color: #000000 !important;
          border-bottom-width: 0.75px !important;
          padding-bottom: 2px !important;
        }
      `}</style>

      {/* Web Header Controls */}
      <div className="no-print bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 hover:text-slate-900 transition flex items-center gap-1 text-sm font-semibold"
            >
              <Undo2 className="w-4 h-4" />
              กลับ
            </button>
            <div className="h-6 w-px bg-slate-200"></div>
            <div>
              <h1 className="text-base font-bold text-slate-800 flex items-center gap-1.5 font-sans">
                <span>รายงานของ:</span>
                <span className="text-emerald-800">
                  {title} {firstName} {lastName}
                </span>
              </h1>
              <p className="text-xs text-slate-500">{position}</p>
            </div>
          </div>

          {/* Quick selections */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1">
              <button
                onClick={() => setActiveFormTab("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeFormTab === "all"
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                ทั้งหมด (3 หน้า)
              </button>
              <button
                onClick={() => setActiveFormTab("allowance")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeFormTab === "allowance"
                    ? "bg-white text-emerald-800 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                1. เบี้ยเลี้ยงเหมาจ่าย
              </button>
              <button
                onClick={() => setActiveFormTab("pts")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeFormTab === "pts"
                    ? "bg-white text-indigo-800 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                2. ค่าตอบแทน พ.ต.ส.
              </button>
            </div>

            <button
              onClick={() => setUseThaiNumerals(!useThaiNumerals)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition ${
                useThaiNumerals
                  ? "bg-amber-50 border-amber-300 text-amber-800 font-bold"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {useThaiNumerals ? "✓ เลขไทย (๑, ๒)" : "เลขไทย/อารบิก"}
            </button>

            <button
              onClick={handlePrint}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs px-4 py-2 rounded-xl transition shadow-md shadow-emerald-700/10 flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              พิมพ์รายงาน / บันทึก PDF
            </button>
          </div>
        </div>
      </div>

      {/* Main split preview workspace */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 print-container">
        {/* Web Sidebar parameters */}
        <div className="no-print lg:col-span-1 space-y-6">
          {/* Month/Year Configuration Card */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wider">
              <Calendar className="w-4 h-4 text-emerald-700" />
              กำหนดช่วงเดือนรายงาน
            </h3>

            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">เลือกประจำเดือน</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {THAI_MONTHS.map((m, i) =>
                    i === 0 ? null : (
                      <option key={i} value={i}>
                        {m}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">ปี พ.ศ.</label>
                <input
                  type="number"
                  value={selectedYearBE}
                  onChange={(e) => setSelectedYearBE(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">ลงวันที่ในใบสำคัญ</label>
                <input
                  type="date"
                  value={documentDateStr}
                  onChange={(e) => setDocumentDateStr(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  * โดยทั่วไปจะเป็นวันที่สุดท้ายของเดือน
                </p>
              </div>
            </div>
          </div>

          {/* Quick inline editor values */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wider">
              <Sliders className="w-4 h-4 text-emerald-700" />
              ปรับปรุงรายละเอียดด่วน
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] text-slate-500">ชื่อจริง</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1 px-2.5 text-xs focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500">นามสกุล</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1 px-2.5 text-xs focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500">ตำแหน่ง</label>
                <input
                  type="text"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1 px-2.5 text-xs focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500">อัตราเบี้ยเลี้ยง (บาท)</label>
                <input
                  type="number"
                  value={allowanceRate}
                  onChange={(e) => setAllowanceRate(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1 px-2.5 text-xs focus:ring-1 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500">อัตรา พ.ต.ส. (บาท)</label>
                <input
                  type="number"
                  value={ptsRate}
                  onChange={(e) => setPtsRate(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1 px-2.5 text-xs focus:ring-1 focus:ring-emerald-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Service Time Calculator Card */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                อายุราชการสำหรับใบเบิก
              </h3>
              <label className="flex items-center gap-1 text-[11px] font-semibold text-emerald-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={overrideServiceTime}
                  onChange={(e) => setOverrideServiceTime(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-3 h-3"
                />
                <span>ระบุเอง</span>
              </label>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-500 text-center">ปี</label>
                  <input
                    type="number"
                    disabled={!overrideServiceTime}
                    value={customYears}
                    onChange={(e) => setCustomYears(Number(e.target.value))}
                    className="w-full bg-slate-50 disabled:bg-slate-100 border border-slate-200 rounded-lg py-1 text-center text-xs font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 text-center">เดือน</label>
                  <input
                    type="number"
                    disabled={!overrideServiceTime}
                    value={customMonths}
                    onChange={(e) => setCustomMonths(Number(e.target.value))}
                    className="w-full bg-slate-50 disabled:bg-slate-100 border border-slate-200 rounded-lg py-1 text-center text-xs font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 text-center">วัน</label>
                  <input
                    type="number"
                    disabled={!overrideServiceTime}
                    value={customDays}
                    onChange={(e) => setCustomDays(Number(e.target.value))}
                    className="w-full bg-slate-50 disabled:bg-slate-100 border border-slate-200 rounded-lg py-1 text-center text-xs font-bold font-mono"
                  />
                </div>
              </div>

              {!overrideServiceTime && (
                <p className="text-[10px] text-slate-400 text-center">
                  * คำนวณอัตโนมัติตามระยะเวลาจริงถึงสิ้นเดือน
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Printable preview list */}
        <div className="lg:col-span-3 space-y-8 print-container overflow-x-auto pb-6">
          {/* ========================================================== */}
          {/* PAGE 1: ใบขอรับเงินค่าตอบแทนเบี้ยเลี้ยงเหมาจ่าย (พ.ศ.2566) */}
          {/* ========================================================== */}
          {(activeFormTab === "all" || activeFormTab === "allowance") && (
            <div className="print-page text-black leading-[1.45] text-[14.5px]">
              {/* Document Header */}
              <div className="text-center space-y-0.5 mb-2">
                <h2 className="text-[15.5px] font-bold">ใบขอรับเงินค่าตอบแทนเบี้ยเลี้ยงเหมาจ่ายสำหรับเจ้าหน้าที่</h2>
                <h2 className="text-[15.5px] font-bold">ที่ปฏิบัติงานในหน่วยบริการสังกัดกระทรวงสาธารณสุข</h2>
                <h2 className="text-[15.5px] font-bold">พ.ศ.2566</h2>
              </div>
 
              {/* Monthly line */}
              <div className="flex justify-center items-center gap-1.5 mb-2.5">
                <span>ประจำเดือน</span>
                <span className="font-semibold border-b border-dotted border-black px-3 min-w-[90px] text-center">{formattedMonth}</span>
                <span>พ.ศ.</span>
                <span className="font-semibold border-b border-dotted border-black px-3 min-w-[65px] text-center">{num(selectedYearBE)}</span>
              </div>
 
              {/* Personal info paragraph */}
              <div className="space-y-1.5 text-justify">
                <p className="indent-8">
                  ข้าพเจ้า ชื่อ <span className="font-semibold border-b border-dotted border-black px-2">{title} {firstName}</span>
                  นามสกุล <span className="font-semibold border-b border-dotted border-black px-2">{lastName}</span>
                  ตำแหน่ง <span className="font-semibold border-b border-dotted border-black px-2">{position}</span>
                </p>
                <p>
                  ปัจจุบันปฏิบัติงานที่ รพศ./รพท./รพ./รพ.สต. <span className="font-semibold border-b border-dotted border-black px-2">{workplace}</span>
                  จังหวัด <span className="font-semibold border-b border-dotted border-black px-2">{province}</span>
                  ระดับ GIS <span className="font-semibold border-b border-dotted border-black px-2 uppercase">{num(gisLevel)}</span>
                </p>
                <p>
                  ได้ปฏิบัติงานในหน่วยบริการหรือหน่วยบริการในเครือข่าย
                  <span className="font-semibold border-b border-dotted border-black px-2">{num(customYears)}</span> ปี 
                  <span className="font-semibold border-b border-dotted border-black px-2">{num(customMonths)}</span> เดือน 
                  <span className="font-semibold border-b border-dotted border-black px-2">{num(customDays || " - ")}</span> วัน (นับถึงวันสิ้นเดือนที่เบิกจ่าย)
                  ได้รับเงินจำนวน <span className="font-semibold border-b border-dotted border-black px-2">{num(formatNumber(allowanceRate))}</span> บาท
                  (<span className="font-semibold border-b border-dotted border-black px-2">{bahtText(allowanceRate)}</span>)
                </p>
 
                <p className="font-bold pt-0.5">
                  โดยมีรายละเอียดการปฏิบัติงาน ดังต่อไปนี้ (เฉพาะสายแพทย์ตอบข้อ 1 ด้วย)
                </p>
              </div>

              {/* Timeline listings (mimicking the 1-6 rules) */}
              <div className="space-y-1.5 mt-2 text-justify text-[13.5px] leading-[1.4]">
                {/* Rule: Internship (Doctors) - Unnumbered */}
                <div className="text-black pl-0">
                  เริ่มฝึกเพิ่มพูนทักษะที่
                  <div className="pl-6 space-y-0.5 mt-0.5 text-black">
                    <p>
                      รพช. <span className="border-b border-dotted border-black inline-block w-[140px]">&nbsp;</span> 
                      จังหวัด <span className="border-b border-dotted border-black inline-block w-[120px]">&nbsp;</span> 
                      ตั้งแต่วันที่ <span className="border-b border-dotted border-black inline-block w-[100px]">&nbsp;</span> 
                      ถึงวันที่ <span className="border-b border-dotted border-black inline-block w-[100px]">&nbsp;</span>
                    </p>
                    <p>
                      รพท./รพศ. <span className="border-b border-dotted border-black inline-block w-[130px]">&nbsp;</span> 
                      จังหวัด <span className="border-b border-dotted border-black inline-block w-[120px]">&nbsp;</span> 
                      ตั้งแต่วันที่ <span className="border-b border-dotted border-black inline-block w-[100px]">&nbsp;</span> 
                      ถึงวันที่ <span className="border-b border-dotted border-black inline-block w-[100px]">&nbsp;</span>
                    </p>
                    <p>
                      รวม <span className="border-b border-dotted border-black inline-block w-[40px] text-center">&nbsp;</span> ปี 
                      <span className="border-b border-dotted border-black inline-block w-[40px] text-center">&nbsp;</span> เดือน 
                      <span className="border-b border-dotted border-black inline-block w-[40px] text-center">&nbsp;</span> วัน (กรณีนี้ให้นับการฝึกที่ รพท./รพศ. เป็นอายุราชการได้)
                    </p>
                  </div>
                </div>
 
                {/* Rule 1: Primary workspace */}
                <div className="pl-6 relative">
                  <span className="absolute left-0 top-0 font-semibold">1.</span>
                  ปฏิบัติงานที่ รพศ./รพท./รพ./รพ.สต. <span className="font-semibold border-b border-dotted border-black px-1.5">{workplace}</span> จังหวัด <span className="font-semibold border-b border-dotted border-black px-1.5">{province}</span>
                  <div className="mt-0.5">
                    ตั้งแต่วันที่ <span className="font-semibold border-b border-dotted border-black px-1.5">{num(officer.workHistories[0] ? officer.workHistories[0].startDate.split("-")[2] : "11")} {THAI_MONTHS[officer.workHistories[0] ? parseInt(officer.workHistories[0].startDate.split("-")[1]) : 5]} {num(officer.workHistories[0] ? parseInt(officer.workHistories[0].startDate.split("-")[0]) + 543 : 2547)}</span>
                    ถึงวันที่ <span className="font-semibold border-b border-dotted border-black px-1.5">{num(getDayOfDocDate())} {formattedMonth} {num(selectedYearBE)}</span>
                    รวม <span className="font-semibold border-b border-dotted border-black px-1.5">{num(customYears)}</span> ปี 
                    <span className="font-semibold border-b border-dotted border-black px-1.5">{num(customMonths)}</span> เดือน 
                    <span className="font-semibold border-b border-dotted border-black px-1.5">{num(customDays || " - ")}</span> วัน
                  </div>
                </div>
 
                {/* Rules 2 - 5: Left empty as placeholder underlines just like the standard format */}
                {[2, 3, 4, 5].map((numVal) => (
                  <div key={numVal} className="pl-6 relative text-black">
                    <span className="absolute left-0 top-0">{numVal}.</span>
                    ปฏิบัติงานที่ รพศ./รพท./รพ./รพ.สต. <span className="border-b border-dotted border-black inline-block w-[180px]">&nbsp;</span> จังหวัด <span className="border-b border-dotted border-black inline-block w-[110px]">&nbsp;</span>
                    <div className="mt-0.5">
                      ตั้งแต่วันที่ <span className="border-b border-dotted border-black inline-block w-[110px]">&nbsp;</span> ถึงวันที่ <span className="border-b border-dotted border-black inline-block w-[110px]">&nbsp;</span> รวม <span className="border-b border-dotted border-black inline-block w-[30px]">&nbsp;</span> ปี <span className="border-b border-dotted border-black inline-block w-[30px]">&nbsp;</span> เดือน <span className="border-b border-dotted border-black inline-block w-[30px]">&nbsp;</span> วัน
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Summary */}
              <div className="mt-2 pt-1 border-t border-slate-300">
                <p className="font-semibold">
                  รวมทั้งสิ้น <span className="border-b border-dotted border-black px-3">{num(customYears)}</span> ปี 
                  <span className="border-b border-dotted border-black px-3">{num(customMonths)}</span> เดือน 
                  <span className="border-b border-dotted border-black px-3">{num(customDays || " - ")}</span> วัน
                </p>
                <p className="text-[12px] text-black mt-0.5 text-justify leading-snug">
                  (กรณีหน่วยงานเรียกเงินคืน ข้าพเจ้ายินดีชดใช้คืนตามจำนวนเงินที่ได้รับมา โดยไม่มีเงื่อนไขใดๆภายใน 15 วัน หลังจากได้รับหนังสือแจ้งจากหน่วยงาน)
                </p>
              </div>

              {/* Signature area */}
              <div className="mt-2 text-center space-y-1">
                <p className="text-[13.5px]">ข้าพเจ้าขอรับรองว่าข้อมูลดังกล่าวเป็นความจริงทุกประการ</p>
                
                <div className="w-[300px] ml-auto space-y-0.5 mt-1">
                  <p className="border-b border-dotted border-black pb-0.5 text-black">&nbsp;</p>
                  <p className="font-semibold whitespace-nowrap">({title} {firstName} {lastName})</p>
                  <p className="text-[13px] text-black whitespace-nowrap">ตำแหน่ง {position}</p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* PAGE 2: ใบสำคัญรับเงิน (รูปที่ ๙) - เบี้ยเลี้ยงเหมาจ่าย */}
          {/* ========================================================== */}
          {(activeFormTab === "all" || activeFormTab === "allowance") && (
            <div className="print-page text-black leading-[1.45] text-[15.5px]">
              {/* Title Header */}
              <div className="text-center mb-3">
                <h2 className="text-[18px] font-bold">ใบสำคัญรับเงิน (รูปที่ ๙)</h2>
              </div>

              {/* Hospital name and Date row */}
              <div className="flex justify-between items-start mb-3.5">
                <div>
                  <span className="font-bold">ที่</span> <span className="border-b border-dotted border-black px-1.5">{workplace}</span>
                </div>
                <div className="text-right">
                  <span>วันที่</span> <span className="border-b border-dotted border-black px-2">{num(getDayOfDocDate())}</span> 
                  <span>เดือน</span> <span className="border-b border-dotted border-black px-2">{formattedMonth}</span> 
                  <span>พ.ศ.</span> <span className="border-b border-dotted border-black px-2">{num(selectedYearBE)}</span>
                </div>
              </div>

              {/* Main text descriptor */}
              <div className="text-justify leading-relaxed mb-3.5">
                <p className="indent-10">
                  ข้าพเจ้า <span className="font-semibold border-b border-dotted border-black px-2">{title} {firstName} {lastName}</span> 
                  บ้านเลขที่ <span className="border-b border-dotted border-black px-1.5">{num(houseNo)}</span> 
                  หมู่ที่ <span className="border-b border-dotted border-black px-1.5">{num(moo)}</span> 
                  ตำบล <span className="border-b border-dotted border-black px-1.5">{subdistrict}</span> 
                  อำเภอ <span className="border-b border-dotted border-black px-1.5">{district}</span> 
                  จังหวัด <span className="border-b border-dotted border-black px-1.5">{addressProvince}</span> 
                  ได้รับเงินจาก <span className="font-semibold border-b border-dotted border-black px-2">{fundSourceAllowance}</span> อำเภอเดชอุดม จังหวัดอุบลราชธานี ดังรายการต่อไปนี้
                </p>
              </div>

              {/* Table details */}
              <table className="w-full border-collapse border border-black text-[14.5px] mb-6">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="border border-black py-1.5 px-4 text-center font-bold w-[70%]">รายการ</th>
                    <th className="border border-black py-1.5 px-2 text-center font-bold w-[20%]">บาท</th>
                    <th className="border border-black py-1.5 px-2 text-center font-bold w-[10%]">สต.</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-black p-4 leading-relaxed h-[270px] align-top">
                      - ได้รับเงินค่าตอบแทนเบี้ยเลี้ยงเหมาจ่ายสำหรับเจ้าหน้าที่ที่ปฏิบัติงานในหน่วยบริการสังกัดกระทรวงสาธารณสุขพ.ศ.2566 <br />
                      ประจำเดือน <span className="font-semibold border-b border-dotted border-black px-1">{formattedMonth}</span> พ.ศ. <span className="font-semibold border-b border-dotted border-black px-1">{num(selectedYearBE)}</span> เป็นเงิน
                    </td>
                    <td className="border border-black p-4 align-top text-right font-mono font-bold text-base">
                      {num(formatNumber(allowanceRate))}
                    </td>
                    <td className="border border-black p-4 align-top text-center font-bold">
                      {num("๐๐")}
                    </td>
                  </tr>
                  {/* Total row */}
                  <tr className="bg-slate-50/50">
                    <td className="border border-black py-1.5 px-4 font-bold text-left">
                      รวมเงิน (ตัวอักษร) ({bahtText(allowanceRate)})
                    </td>
                    <td className="border border-black py-1.5 px-4 text-right font-mono font-bold text-base">
                      {num(formatNumber(allowanceRate))}
                    </td>
                    <td className="border border-black py-1.5 px-2 text-center font-bold">
                      {num("๐๐")}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 mt-6 text-center text-[14.5px]">
                <div className="space-y-2">
                  <p className="text-black">..................................................</p>
                  <div>
                    <p className="font-bold">ผู้จ่ายเงิน</p>
                    <p className="text-[13px] text-black">( .................................................. )</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-black">..................................................</p>
                  <div>
                    <p className="font-bold">ผู้รับเงิน</p>
                    <p className="font-semibold">({title} {firstName} {lastName})</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* PAGE 3: ใบสำคัญรับเงิน (รูปที่ 9) - พ.ต.ส. */}
          {/* ========================================================== */}
          {(activeFormTab === "all" || activeFormTab === "pts") && (
            <div className="print-page text-black leading-[1.45] text-[15.5px]">
              {/* Title Header */}
              <div className="text-center mb-3">
                <h2 className="text-[18px] font-bold">ใบสำคัญรับเงิน (รูปที่ 9)</h2>
              </div>

              {/* Hospital name and Date row */}
              <div className="flex justify-between items-start mb-3.5">
                <div>
                  <span className="font-bold">ที่</span> <span className="border-b border-dotted border-black px-1.5">{workplace}</span>
                </div>
                <div className="text-right">
                  <span>วันที่</span> <span className="border-b border-dotted border-black px-2">{num(getDayOfDocDate())}</span> 
                  <span>เดือน</span> <span className="border-b border-dotted border-black px-2">{formattedMonth}</span> 
                  <span>พ.ศ.</span> <span className="border-b border-dotted border-black px-2">{num(selectedYearBE)}</span>
                </div>
              </div>

              {/* Main text descriptor */}
              <div className="text-justify leading-relaxed mb-3.5">
                <p className="indent-10">
                  ข้าพเจ้า <span className="font-semibold border-b border-dotted border-black px-2">{title} {firstName} {lastName}</span> 
                  อยู่บ้านเลขที่ <span className="border-b border-dotted border-black px-1.5">{num(houseNo)}</span> 
                  หมู่ <span className="border-b border-dotted border-black px-1.5">{num(moo)}</span> 
                  ตำบล <span className="border-b border-dotted border-black px-1.5">{subdistrict}</span> 
                  อำเภอ <span className="border-b border-dotted border-black px-1.5">{district}</span> 
                  จังหวัด <span className="border-b border-dotted border-black px-1.5">{addressProvince}</span> 
                  ได้รับเงินจาก <span className="font-semibold border-b border-dotted border-black px-2">{fundSourcePts}</span> อำเภอเดชอุดม จังหวัดอุบลราชธานี ดังรายการต่อไปนี้
                </p>
              </div>

              {/* Table details */}
              <table className="w-full border-collapse border border-black text-[14.5px] mb-6">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="border border-black py-1.5 px-4 text-center font-bold w-[70%]">รายการ</th>
                    <th className="border border-black py-1.5 px-2 text-center font-bold w-[30%]">จำนวนเงิน</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-black p-4 leading-relaxed h-[270px] align-top text-justify">
                      - ได้รับค่าตอบแทนประเภท เงินเพิ่มสำหรับตำแหน่งที่มีเหตุพิเศษของผู้ปฏิบัติงานด้านสาธารณสุข (พ.ต.ส.) <br />
                      ประจำเดือน <span className="font-semibold border-b border-dotted border-black px-1">{formattedMonth}</span> พ.ศ. <span className="font-semibold border-b border-dotted border-black px-1">{num(selectedYearBE)}</span> เป็นเงิน
                    </td>
                    <td className="border border-black p-4 align-top text-right font-mono font-bold text-base">
                      {num(formatNumber(ptsRate))}
                    </td>
                  </tr>
                  {/* Total row formatted like the specific sample */}
                  <tr className="bg-slate-50/50">
                    <td className="border border-black py-1.5 px-4 text-left">
                      <strong>จำนวนเงิน(ตัวอักษร)</strong> ( <span className="font-semibold">-{bahtText(ptsRate)}-</span> )
                    </td>
                    <td className="border border-black py-1.5 px-4 text-right font-mono font-bold text-base">
                      {num(formatNumber(ptsRate))}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 mt-6 text-center text-[14.5px]">
                <div className="space-y-2">
                  <p className="text-black">..................................................</p>
                  <div>
                    <p className="font-bold">ผู้จ่ายเงิน</p>
                    <p className="text-[13px] text-black">( .................................................. )</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-black">..................................................</p>
                  <div>
                    <p className="font-bold">ผู้รับเงิน</p>
                    <p className="font-semibold">({title} {firstName} {lastName})</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Guidelines notes - no-print */}
          <div className="no-print bg-amber-50 border border-amber-200 rounded-xl p-5 text-xs text-amber-800 space-y-2 max-w-4xl">
            <h4 className="font-bold text-sm flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-amber-600" />
              ข้อเสนอแนะและข้อแนะนำจากกระทรวงสาธารณสุข:
            </h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>ให้เรียงเอกสารส่งตามลำดับ: 1. ใบขอรับเงินฯ 2. ใบสำคัญรับเงิน (รูปที่ ๙) 3. สำเนาบัตรประชาชน/ใบขับขี่</li>
              <li>ใบสำคัญรับเงิน (รูปที่ ๙) และ (รูปที่ 9) แนะนำให้ใช้ลงวันที่ ณ วันที่สุดท้ายของแต่ละเดือน</li>
              <li>แพทย์และทันตแพทย์ สามารถใช้แบบฟอร์มนี้ได้เช่นกัน โดยกรอกเพิ่มในช่องเริ่มฝึกเพิ่มพูนทักษะที่ข้อ 1</li>
              <li>สามารถกด <strong>พิมพ์รายงาน / บันทึก PDF</strong> เพื่อดาวน์โหลดเก็บเป็นไฟล์เอกสารได้ทันทีผ่านระบบพิมพ์ของเว็บเบราว์เซอร์</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
