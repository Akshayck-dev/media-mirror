import * as XLSX from 'xlsx';

export const exportToExcel = (data: any[], fileName: string) => {
  try {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Export');
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  } catch (error) {
    console.error('Failed to export to Excel:', error);
  }
};

export default exportToExcel;
