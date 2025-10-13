import * as XLSX from 'xlsx';

export const loadExcelData = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        console.log('File loaded successfully');
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        console.log('Sheet names:', workbook.SheetNames);
        
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        console.log('Raw Excel data:', jsonData);
        
        if (jsonData.length === 0) {
          throw new Error('No data found in Excel file');
        }

        // Process data - SPECIFIC TO YOUR FILE FORMAT
        const processedData = jsonData.map((item, index) => {
          console.log(`Processing row ${index}:`, item);
          
          // Your file has columns: "stock name" and "levels"
          const symbol = item['stock name'] || item['Stock Name'] || item.stock || item.STOCK;
          const level = item.levels || item.Level || item.level || item.PRICE;
          
          console.log(`Extracted - Symbol: "${symbol}", Level: "${level}"`);

          if (!symbol || level === undefined || level === null) {
            console.warn(`Row ${index} missing symbol or level:`, item);
            return null;
          }

          let processedSymbol = symbol.toString().trim();
          
          // Add .NS suffix if not present
          if (!processedSymbol.includes('.') && !processedSymbol.includes('.NS') && !processedSymbol.includes('.BO')) {
            processedSymbol = `${processedSymbol}.NS`;
          }
          
          const processedLevel = parseFloat(level);
          
          if (isNaN(processedLevel)) {
            console.warn(`Invalid level value in row ${index}:`, level);
            return null;
          }

          const result = {
            originalSymbol: symbol.toString().trim(),
            symbol: processedSymbol,
            level: processedLevel,
            name: symbol.toString().trim() // Using symbol as name since you don't have separate name column
          };
          
          console.log(`Processed row ${index}:`, result);
          return result;
        }).filter(item => item !== null);

        console.log('Final processed data:', processedData);
        
        if (processedData.length === 0) {
          throw new Error('No valid data found. Please check if your Excel has "stock name" and "levels" columns.');
        }

        resolve(processedData);
      } catch (error) {
        console.error('Error processing Excel file:', error);
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      console.error('FileReader error:', error);
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

export const getStockLevels = (excelData, selectedSymbol) => {
  if (!excelData || !selectedSymbol) {
    console.log('No excel data or selected symbol:', { excelData, selectedSymbol });
    return [];
  }
  
  const levels = excelData
    .filter(item => item.symbol === selectedSymbol)
    .map(item => item.level);
  
  console.log(`Levels found for ${selectedSymbol}:`, levels);
  return levels;
};