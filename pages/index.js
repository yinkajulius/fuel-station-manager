import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, DollarSign, Fuel, Calculator, Calendar } from 'lucide-react';

const FuelStationManager = () => {
  const [activeTab, setActiveTab] = useState('sales');
  const [salesRecords, setSalesRecords] = useState([]);
  const [expenseRecords, setExpenseRecords] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Sales Record Form State
  const [salesForm, setSalesForm] = useState({
    date: new Date().toISOString().split('T')[0],
    pms: { pricePerLiter: 0, salesVolume: 0 },
    ago: { pricePerLiter: 0, salesVolume: 0 },
    dpk: { pricePerLiter: 0, salesVolume: 0 },
    lpg: { pricePerLiter: 0, salesVolume: 0 }
  });

  // Expense Form State
  const [expenseForm, setExpenseForm] = useState({
    type: 'production',
    driverName: '',
    ticketNumber: '',
    productType: 'PMS',
    pricePerLiter: 0,
    quantity: 0,
    purpose: '',
    amount: 0
  });

  const products = [
    { key: 'pms', label: 'PMS (Premium Motor Spirit)', color: 'bg-blue-500' },
    { key: 'ago', label: 'AGO (Automotive Gas Oil)', color: 'bg-green-500' },
    { key: 'dpk', label: 'DPK (Dual Purpose Kerosene)', color: 'bg-yellow-500' },
    { key: 'lpg', label: 'LPG (Liquified Petroleum Gas)', color: 'bg-purple-500' }
  ];

  const resetSalesForm = () => {
    setSalesForm({
      date: new Date().toISOString().split('T')[0],
      pms: { pricePerLiter: 0, salesVolume: 0 },
      ago: { pricePerLiter: 0, salesVolume: 0 },
      dpk: { pricePerLiter: 0, salesVolume: 0 },
      lpg: { pricePerLiter: 0, salesVolume: 0 }
    });
    setIsEditing(false);
    setEditingId(null);
  };

  const resetExpenseForm = () => {
    setExpenseForm({
      type: 'production',
      driverName: '',
      ticketNumber: '',
      productType: 'PMS',
      pricePerLiter: 0,
      quantity: 0,
      purpose: '',
      amount: 0
    });
  };

  const calculateSubtotal = (pricePerLiter, salesVolume) => {
    return Number(pricePerLiter) * Number(salesVolume);
  };

  const calculateTotalSales = (record) => {
    return products.reduce((total, product) => {
      const productData = record[product.key];
      return total + calculateSubtotal(productData.pricePerLiter, productData.salesVolume);
    }, 0);
  };

  const handleSalesSubmit = (e) => {
    e.preventDefault();
    const newRecord = {
      id: isEditing ? editingId : Date.now(),
      date: salesForm.date,
      ...salesForm
    };

    if (isEditing) {
      setSalesRecords(prev => prev.map(record => 
        record.id === editingId ? newRecord : record
      ));
    } else {
      setSalesRecords(prev => [...prev, newRecord]);
    }
    resetSalesForm();
  };

  const handleExpenseSubmit = (e) => {
    e.preventDefault();
    const newExpense = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      ...expenseForm,
      total: expenseForm.type === 'production' 
        ? expenseForm.pricePerLiter * expenseForm.quantity 
        : expenseForm.amount
    };

    setExpenseRecords(prev => [...prev, newExpense]);
    resetExpenseForm();
  };

  const editSalesRecord = (record) => {
    setSalesForm({
      date: record.date,
      pms: record.pms,
      ago: record.ago,
      dpk: record.dpk,
      lpg: record.lpg
    });
    setIsEditing(true);
    setEditingId(record.id);
    setActiveTab('sales');
  };

  const deleteSalesRecord = (id) => {
    setSalesRecords(prev => prev.filter(record => record.id !== id));
  };

  const deleteExpenseRecord = (id) => {
    setExpenseRecords(prev => prev.filter(record => record.id !== id));
  };

  const totalExpenses = expenseRecords.reduce((sum, expense) => sum + expense.total, 0);
  const totalSalesRevenue = salesRecords.reduce((sum, record) => sum + calculateTotalSales(record), 0);
  const grandTotal = totalSalesRevenue - totalExpenses;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-blue-500">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Fuel className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">YINKA JULIUS PETROLEUM</h1>
                <p className="text-gray-600">Fuel Station Management System</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Today's Date</div>
              <div className="text-lg font-semibold text-gray-800">
                {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Sales</p>
                <p className="text-2xl font-bold text-green-600">
                  ₦{totalSalesRevenue.toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">
                  ₦{totalExpenses.toLocaleString()}
                </p>
              </div>
              <Calculator className="h-8 w-8 text-red-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Net Profit</p>
                <p className={`text-2xl font-bold ${grandTotal >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  ₦{grandTotal.toLocaleString()}
                </p>
              </div>
              <Fuel className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Records Today</p>
                <p className="text-2xl font-bold text-purple-600">
                  {salesRecords.filter(r => r.date === new Date().toISOString().split('T')[0]).length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('sales')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'sales' 
                  ? 'bg-blue-500 text-white border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-blue-500'
              }`}
            >
              Sales Records
            </button>
            <button
              onClick={() => setActiveTab('expenses')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'expenses' 
                  ? 'bg-blue-500 text-white border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-blue-500'
              }`}
            >
              Expenses
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'reports' 
                  ? 'bg-blue-500 text-white border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-blue-500'
              }`}
            >
              Reports
            </button>
          </div>
        </div>

        {/* Sales Tab */}
        {activeTab === 'sales' && (
          <div className="space-y-6">
            {/* Sales Form */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                {isEditing ? 'Edit Sales Record' : 'Add New Sales Record'}
              </h2>
              
              <form onSubmit={handleSalesSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      value={salesForm.date}
                      onChange={(e) => setSalesForm(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {products.map(product => (
                    <div key={product.key} className="bg-gray-50 p-4 rounded-lg">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-white text-sm font-medium mb-3 ${product.color}`}>
                        {product.label}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Price per Liter (₦)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={salesForm[product.key].pricePerLiter}
                            onChange={(e) => setSalesForm(prev => ({
                              ...prev,
                              [product.key]: {
                                ...prev[product.key],
                                pricePerLiter: Number(e.target.value)
                              }
                            }))}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Sales Volume (L)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={salesForm[product.key].salesVolume}
                            onChange={(e) => setSalesForm(prev => ({
                              ...prev,
                              [product.key]: {
                                ...prev[product.key],
                                salesVolume: Number(e.target.value)
                              }
                            }))}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      
                      <div className="mt-2 text-right">
                        <span className="text-sm text-gray-600">Subtotal: </span>
                        <span className="font-semibold text-gray-800">
                          ₦{calculateSubtotal(
                            salesForm[product.key].pricePerLiter,
                            salesForm[product.key].salesVolume
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-right">
                    <span className="text-lg text-gray-700">Total Sales: </span>
                    <span className="text-2xl font-bold text-blue-600">
                      ₦{products.reduce((total, product) => {
                        const productData = salesForm[product.key];
                        return total + calculateSubtotal(productData.pricePerLiter, productData.salesVolume);
                      }, 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="flex items-center space-x-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Plus className="h-5 w-5" />
                    <span>{isEditing ? 'Update Record' : 'Add Record'}</span>
                  </button>
                  
                  {isEditing && (
                    <button
                      type="button"
                      onClick={resetSalesForm}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Sales Records List */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Sales Records</h2>
              
              {salesRecords.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No sales records found. Add your first record above.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                        {products.map(product => (
                          <th key={product.key} className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                            {product.key.toUpperCase()}
                          </th>
                        ))}
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Total</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {salesRecords.map(record => (
                        <tr key={record.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-800">
                            {new Date(record.date).toLocaleDateString()}
                          </td>
                          {products.map(product => (
                            <td key={product.key} className="px-4 py-3 text-center text-sm">
                              <div className="text-gray-800">
                                ₦{record[product.key].pricePerLiter}/L
                              </div>
                              <div className="text-gray-600">
                                {record[product.key].salesVolume}L
                              </div>
                              <div className="font-semibold text-gray-800">
                                ₦{calculateSubtotal(
                                  record[product.key].pricePerLiter,
                                  record[product.key].salesVolume
                                ).toLocaleString()}
                              </div>
                            </td>
                          ))}
                          <td className="px-4 py-3 text-center font-semibold text-blue-600">
                            ₦{calculateTotalSales(record).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex justify-center space-x-2">
                              <button
                                onClick={() => editSalesRecord(record)}
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => deleteSalesRecord(record.id)}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Expenses Tab */}
        {activeTab === 'expenses' && (
          <div className="space-y-6">
            {/* Expense Form */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Add New Expense</h2>
              
              <form onSubmit={handleExpenseSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expense Type
                  </label>
                  <select
                    value={expenseForm.type}
                    onChange={(e) => setExpenseForm(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="production">Production Collection</option>
                    <option value="general">General Expenses</option>
                  </select>
                </div>

                {expenseForm.type === 'production' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Driver Name
                      </label>
                      <input
                        type="text"
                        value={expenseForm.driverName}
                        onChange={(e) => setExpenseForm(prev => ({ ...prev, driverName: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ticket Number
                      </label>
                      <input
                        type="text"
                        value={expenseForm.ticketNumber}
                        onChange={(e) => setExpenseForm(prev => ({ ...prev, ticketNumber: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Type
                      </label>
                      <select
                        value={expenseForm.productType}
                        onChange={(e) => setExpenseForm(prev => ({ ...prev, productType: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="PMS">PMS</option>
                        <option value="AGO">AGO</option>
                        <option value="DPK">DPK</option>
                        <option value="LPG">LPG</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price per Liter (₦)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={expenseForm.pricePerLiter}
                        onChange={(e) => setExpenseForm(prev => ({ ...prev, pricePerLiter: Number(e.target.value) }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity (Liters)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={expenseForm.quantity}
                        onChange={(e) => setExpenseForm(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-sm text-gray-600">Total Amount</div>
                        <div className="text-xl font-bold text-gray-800">
                          ₦{(expenseForm.pricePerLiter * expenseForm.quantity).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Purpose
                      </label>
                      <input
                        type="text"
                        value={expenseForm.purpose}
                        onChange={(e) => setExpenseForm(prev => ({ ...prev, purpose: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Amount (₦)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={expenseForm.amount}
                        onChange={(e) => setExpenseForm(prev => ({ ...prev, amount: Number(e.target.value) }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="flex items-center space-x-2 bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  <span>Add Expense</span>
                </button>
              </form>
            </div>

            {/* Expenses List */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Expense Records</h2>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Total Expenses</div>
                  <div className="text-2xl font-bold text-red-600">
                    ₦{totalExpenses.toLocaleString()}
                  </div>
                </div>
              </div>
              
              {expenseRecords.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No expense records found. Add your first expense above.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Type</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Details</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Amount</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {expenseRecords.map(expense => (
                        <tr key={expense.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-800">
                            {new Date(expense.date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              expense.type === 'production' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {expense.type === 'production' ? 'Production' : 'General'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-800">
                            {expense.type === 'production' ? (
                              <div>
                                <div><strong>Driver:</strong> {expense.driverName}</div>
                                <div><strong>Ticket:</strong> {expense.ticketNumber}</div>
                                <div><strong>Product:</strong> {expense.productType}</div>
                                <div><strong>Quantity:</strong> {expense.quantity}L @ ₦{expense.pricePerLiter}/L</div>
                              </div>
                            ) : (
                              <div><strong>Purpose:</strong> {expense.purpose}</div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center font-semibold text-red-600">
                            ₦{expense.total.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => deleteExpenseRecord(expense.id)}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
