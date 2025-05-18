import React, { useState } from 'react';

const defaultItem = {
  productName: '',
  size: '',
  quantity: 1,
  edgeDetail: 'Eased'
};

const StoneTopEstimator = () => {
  const [items, setItems] = useState([{ ...defaultItem }]);

  const handleChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const addItem = () => {
    setItems([...items, { ...defaultItem }]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitted Items:', items);
    alert('Submitted! Check console.');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Stone Top Estimator</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {items.map((item, index) => (
          <div key={index} className="border p-4 rounded space-y-4 bg-white shadow-md">
            <div className="flex space-x-4">
              <input
                type="text"
                placeholder="Product Name"
                value={item.productName}
                onChange={(e) => handleChange(index, 'productName', e.target.value)}
                className="flex-1 border px-4 py-2 rounded"
                required
              />
              <input
                type="text"
                placeholder="Size (e.g. 24x36)"
                value={item.size}
                onChange={(e) => handleChange(index, 'size', e.target.value)}
                className="flex-1 border px-4 py-2 rounded"
                required
              />
            </div>
            <div className="flex space-x-4">
              <input
                type="number"
                placeholder="Quantity"
                value={item.quantity}
                onChange={(e) => handleChange(index, 'quantity', parseInt(e.target.value) || 1)}
                min="1"
                className="w-1/2 border px-4 py-2 rounded"
                required
              />
              <select
                value={item.edgeDetail}
                onChange={(e) => handleChange(index, 'edgeDetail', e.target.value)}
                className="w-1/2 border px-4 py-2 rounded"
              >
                <option value="Eased">Eased</option>
                <option value="1.5” mitered">1.5” mitered</option>
              </select>
            </div>
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="text-red-500 text-sm"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={addItem} className="bg-blue-600 text-white px-4 py-2 rounded">
          Add Another Product
        </button>
        <button type="submit" className="ml-4 bg-green-600 text-white px-4 py-2 rounded">
          Submit
        </button>
      </form>
    </div>
  );
};

export default StoneTopEstimator;