import React, { useState, useEffect } from 'react';
import { Plus, Save, Download, Upload, Trash2, Calendar } from 'lucide-react';

const FuelStationManager = () => {
  const [selectedStation, setSelectedStation] = useState('A');
  const [selectedDate, setSelectedDate] = useState('');
  const [stockData, setStockData] = useState({
    A: {},
    B: {}
  });
  const [salesData, setSalesData] = useState({
    A: [],
    B: []
  });
  
  // Initialize date on client side to avoid hydration mismatch
  useEffect(() => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  }, []);

  const pumps = [
    { id: 'pump1', name: 'Pump 1', fuel: 'PMS' },
    { id: 'pump2', name: 'Pump 2', fuel: 'PMS' },
    { id: 'pump3', name: 'Pump 3', fuel: 'AGO' },
    { id: 'pump4', name: 'Pump 4', fuel: 'LPG' }
  ];

  const [inputMode, setInputMode] = useState({
    pump1: 'sales',
    pump2: 'sales',
    pump3: 'sales',
    pump4: 'sales'
  });

  const [currentInput, setCurrentInput] = useState({
    pump1: { sales: '', openingMeter: '', closingMeter: '' },
    pump2: { sales: '', openingMeter: '', closingMeter: '' },
    pump3: { sales: '', openingMeter: '', closingMeter: '' },
    pump4: { sales: '', openingMeter: '', closingMeter: '' }
  });

  // Initialize data structure for a date if it doesn't exist
  const initializeDateData = (station, date) => {
    if (!date) return;
    if (!stockData[station][date]) {
      const newStockData = { ...stockData };
      newStockData[station][date] = {
        pump1: { opening: 0, closing: 0 },
        pump2: { opening: 0, closing: 0 },
        pump3: { opening: 0, closing: 0 },
        pump4: { opening: 0, closing: 0 }
      };
      setStockData(newStockData);
    }
  };

  // Get previous day's closing stock as today's opening stock
  const getPreviousDayClosing = (station, date, pumpId) => {
    if (!date) return 0;
    const currentDate = new Date(date);
    const previousDate = new Date(currentDate);
    previousDate.setDate(currentDate.getDate() - 1);
    const prevDateStr = previousDate.toISOString().split('T')[0];
    
    if (stockData[station][prevDateStr] && stockData[station][prevDateStr][pumpId]) {
      return stockData[station][prevDateStr][pumpId].closing;
    }
    return 0;
  };

  // Update opening stock when date changes
  useEffect(() => {
    if (!selectedDate) return;
    initializeDateData(selectedStation, selectedDate);
    const newStockData = { ...stockData };
    
    pumps.forEach(pump => {
      const previousClosing = getPreviousDayClosing(selectedStation, selectedDate, pump.id);
      if (newStockData[selectedStation][selectedDate]) {
        newStockData[selectedStation][selectedDate][pump.id].opening = previousClosing;
      }
    });
    
    setStockData(newStockData);
  }, [selectedDate, selectedStation]);

  const handleInputModeChange = (pumpId, mode) => {
    setInputMode(prev => ({
      ...prev,
      [pumpId]: mode
    }));
    
    setCurrentInput(prev => ({
      ...prev,
      [pumpId]: { sales: '', openingMeter: '', closingMeter: '' }
    }));
  };

  const handleInputChange = (pumpId, field, value) => {
    setCurrentInput(prev => ({
      ...prev,
      [pumpId]: {
        ...prev[pumpId],
        [field]: value
      }
    }));
  };

  const calculateSalesFromMeter = (opening, closing) => {
    const openingNum = parseFloat(opening) || 0;
    const closingNum = parseFloat(closing) || 0;
    return Math.max(0, closingNum - openingNum);
  };

  const addSalesEntry = (pumpId) => {
    let salesVolume = 0;
    let meterOpening = '';
    let meterClosing = '';

    if (inputMode[pumpId] === 'sales') {
      salesVolume = parseFloat(currentInput[pumpId].sales) || 0;
    } else {
      meterOpening = currentInput[pumpId].openingMeter;
      meterClosing = currentInput[pumpId].closingMeter;
      salesVolume = calculateSalesFromMeter(meterOpening, meterClosing);
    }

    if (salesVolume <= 0) {
      alert('Please enter valid sales or meter readings');
      return;
    }

    const newStockData = { ...stockData };
    const currentStock = newStockData[selectedStation][selectedDate][pumpId];
    const newClosing = Math.max(0, currentStock.opening - salesVolume);
    
    newStockData[selectedStation][selectedDate][pumpId].closing = newClosing;
    setStockData(newStockData);

    const newSalesData = { ...salesData };
    const salesEntry = {
      id: Date.now(),
      date: selectedDate,
      pump: pumpId,
      pumpName: pumps.find(p => p.id === pumpId).name,
      fuel: pumps.find(p => p.id === pumpId).fuel,
      inputMode: inputMode[pumpId],
      salesVolume,
      openingStock: currentStock.opening,
      closingStock: newClosing,
      timestamp: new Date().toLocaleString()
    };

    if (inputMode[pumpId] === 'meter') {
      salesEntry.meterOpening = meterOpening;
      salesEntry.meterClosing = meterClosing;
    }

    if (!newSalesData[selectedStation]) {
      newSalesData[selectedStation] = [];
    }
    newSalesData[selectedStation].push(salesEntry);
    setSalesData(newSalesData);

    setCurrentInput(prev => ({
      ...prev,
      [pumpId]: { sales: '', openingMeter: '', closingMeter: '' }
    }));
  };

  const setOpeningStock = (pumpId, value) => {
    if (!selectedDate) return;
    const newStockData = { ...stockData };
    initializeDateData(selectedStation, selectedDate);
    newStockData[selectedStation][selectedDate][pumpId].opening = parseFloat(value) || 0;
    newStockData[selectedStation][selectedDate][pumpId].closing = parseFloat(value) || 0;
    setStockData(newStockData);
  };

  const deleteSalesEntry = (entryId) => {
    const newSalesData = { ...salesData };
    newSalesData[selectedStation] = newSalesData[selectedStation].filter(entry => entry.id !== entryId);
    setSalesData(newSalesData);
  };

  const exportData = () => {
    const dataToExport = {
      stockData,
      salesData,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fuel_station_data_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result);
          if (importedData.stockData) setStockData(importedData.stockData);
          if (importedData.salesData) setSalesData(importedData.salesData);
          alert('Data imported successfully!');
        } catch (error) {
          alert('Error importing data. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const getCurrentStock = (pumpId) => {
    if (selectedDate && stockData[selectedStation][selectedDate] && stockData[selectedStation][selectedDate][pumpId]) {
      return stockData[selectedStation][selectedDate][pumpId];
    }
    return { opening: 0, closing: 0 };
  };

  const getTodaySales = (pumpId) => {
    if (!salesData[selectedStation]) return [];
    return salesData[selectedStation].filter(entry => 
      entry.date === selectedDate && entry.pump === pumpId
    );
  };

  // Don't render until date is initialized
  if (!selectedDate) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Fuel Station Management System
        </h1>
        
        <div className="flex flex-wrap gap-4 mb-6 items-center justify-between">
          <div className="flex gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Station</label>
              <select 
                value={selectedStation}
                onChange={(e) => setSelectedStation(e.target.value)}
                className="border rounded-md px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="A">Station A</option>
                <option value="B">Station B</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={exportData}
              className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            
            <label className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors cursor-pointer">
              <Upload className="w-4 h-4" />
              Import
              <input type="file" accept=".json" onChange={importData} className="hidden" />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {pumps.map(pump => {
            const stock = getCurrentStock(pump.id);
            return (
              <div key={pump.id} className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border">
                <h3 className="font-semibold text-lg text-gray-800">{pump.name} ({pump.fuel})</h3>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Opening:</span>
                    <span className="font-medium">{stock.opening.toFixed(2)}L</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Current:</span>
                    <span className="font-medium text-blue-600">{stock.closing.toFixed(2)}L</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Sales Today:</span>
                    <span className="font-medium text-green-600">
                      {getTodaySales(pump.id).reduce((sum, sale) => sum + sale.salesVolume, 0).toFixed(2)}L
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Record Sales</h2>
            
            {pumps.map(pump => {
              const stock = getCurrentStock(pump.id);
              return (
                <div key={pump.id} className="mb-6 p-4 bg-white rounded-lg border">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium text-gray-800">{pump.name} ({pump.fuel})</h3>
                    <div className="text-sm text-gray-600">
                      Current: {stock.closing.toFixed(2)}L
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Set Opening Stock (Litres)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={stock.opening}
                      onChange={(e) => setOpeningStock(pump.id, e.target.value)}
                      className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter opening stock"
                    />
                  </div>

                  <div className="mb-3">
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name={`mode_${pump.id}`}
                          checked={inputMode[pump.id] === 'sales'}
                          onChange={() => handleInputModeChange(pump.id, 'sales')}
                          className="mr-2"
                        />
                        Direct Sales
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name={`mode_${pump.id}`}
                          checked={inputMode[pump.id] === 'meter'}
                          onChange={() => handleInputModeChange(pump.id, 'meter')}
                          className="mr-2"
                        />
                        Meter Reading
                      </label>
                    </div>
                  </div>

                  {inputMode[pump.id] === 'sales' ? (
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sales Volume (Litres)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={currentInput[pump.id].sales}
                        onChange={(e) => handleInputChange(pump.id, 'sales', e.target.value)}
                        className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter sales volume"
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Opening Meter
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={currentInput[pump.id].openingMeter}
                          onChange={(e) => handleInputChange(pump.id, 'openingMeter', e.target.value)}
                          className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                          placeholder="Opening reading"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Closing Meter
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={currentInput[pump.id].closingMeter}
                          onChange={(e) => handleInputChange(pump.id, 'closingMeter', e.target.value)}
                          className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                          placeholder="Closing reading"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => addSalesEntry(pump.id)}
                    className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Sales Entry
                  </button>
                </div>
              );
            })}
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Sales Records - Station {selectedStation} ({selectedDate})
            </h2>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {salesData[selectedStation] && salesData[selectedStation]
                .filter(entry => entry.date === selectedDate)
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .map(entry => (
                  <div key={entry.id} className="bg-white p-4 rounded-lg border shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-gray-800">
                          {entry.pumpName} ({entry.fuel})
                        </h4>
                        <p className="text-sm text-gray-600">{entry.timestamp}</p>
                      </div>
                      <button
                        onClick={() => deleteSalesEntry(entry.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Sales Volume:</span>
                        <span className="font-medium text-green-600 ml-2">
                          {entry.salesVolume.toFixed(2)}L
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Method:</span>
                        <span className="ml-2 capitalize">{entry.inputMode}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Opening:</span>
                        <span className="ml-2">{entry.openingStock.toFixed(2)}L</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Closing:</span>
                        <span className="ml-2">{entry.closingStock.toFixed(2)}L</span>
                      </div>
                      {entry.meterOpening && entry.meterClosing && (
                        <>
                          <div>
                            <span className="text-gray-600">Meter Opening:</span>
                            <span className="ml-2">{entry.meterOpening}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Meter Closing:</span>
                            <span className="ml-2">{entry.meterClosing}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              
              {(!salesData[selectedStation] || 
                salesData[selectedStation].filter(entry => entry.date === selectedDate).length === 0) && (
                <div className="text-center text-gray-500 py-8">
                  No sales records for today
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FuelStationManager;