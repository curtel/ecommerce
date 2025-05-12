import React, { useState, useEffect } from 'react';
import './PaymentMethod.css';
import { API_URL } from '../config';

const PaymentMethod = ({ onSelect, selectedMethod }) => {
    const [paymentMethods, setPaymentMethods] = useState([
        { id: 'cod', name: 'Cash on Delivery', description: 'Pay when you receive your order' },
        { id: 'zalopay', name: 'ZaloPay', description: 'Pay with ZaloPay online payment gateway' }
    ]);
    const [bankList, setBankList] = useState([]);
    const [selectedBank, setSelectedBank] = useState('');
    const [showBanks, setShowBanks] = useState(false);
    const [loading, setLoading] = useState(false);

    // Fetch bank list when ZaloPay is selected
    useEffect(() => {
        if (selectedMethod === 'zalopay') {
            fetchBankList();
            setShowBanks(true);
        } else {
            setShowBanks(false);
            setSelectedBank('');
        }
    }, [selectedMethod]);

    const fetchBankList = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/payment/banks`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch bank list');
            }
            
            const data = await response.json();
            
            if (data.success && data.banks) {
                // Format the bank list for display
                const formattedBanks = [];
                
                // Add ZaloPay wallet option
                formattedBanks.push({
                    bankcode: 'zalopayapp',
                    name: 'ZaloPay Wallet',
                    displayorder: 0
                });
                
                // Add Credit Card option
                formattedBanks.push({
                    bankcode: 'CC',
                    name: 'Credit Card',
                    displayorder: 1
                });
                
                // Add ATM cards
                if (data.banks[2]) { // ATM banks have pmcid 2
                    const atmBanks = data.banks[2] || [];
                    formattedBanks.push(...atmBanks);
                }
                
                // Sort by display order
                formattedBanks.sort((a, b) => a.displayorder - b.displayorder);
                
                setBankList(formattedBanks);
            } else {
                throw new Error(data.message || 'Failed to fetch bank list');
            }
        } catch (error) {
            console.error('Error fetching bank list:', error);
            setBankList([
                { bankcode: 'zalopayapp', name: 'ZaloPay Wallet' },
                { bankcode: 'CC', name: 'Credit Card' },
                { bankcode: 'VCB', name: 'Vietcombank' },
                { bankcode: 'VTB', name: 'Vietinbank' },
                { bankcode: 'TCB', name: 'Techcombank' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleMethodSelect = (methodId) => {
        onSelect({ method: methodId, bankcode: selectedBank });
    };

    const handleBankSelect = (bankcode) => {
        setSelectedBank(bankcode);
        onSelect({ method: selectedMethod, bankcode });
    };

    return (
        <div className="payment-methods">
            <h3>Select Payment Method</h3>
            
            <div className="payment-options">
                {paymentMethods.map(method => (
                    <div 
                        key={method.id}
                        className={`payment-option ${selectedMethod === method.id ? 'selected' : ''}`}
                        onClick={() => handleMethodSelect(method.id)}
                    >
                        <div className="option-radio">
                            <div className={`radio-inner ${selectedMethod === method.id ? 'checked' : ''}`}></div>
                        </div>
                        <div className="option-details">
                            <h4>{method.name}</h4>
                            <p>{method.description}</p>
                        </div>
                    </div>
                ))}
            </div>
            
            {showBanks && (
                <div className="bank-selection">
                    <h4>Select Bank</h4>
                    
                    {loading ? (
                        <div className="loading">Loading banks...</div>
                    ) : (
                        <div className="bank-options">
                            {bankList.map(bank => (
                                <div 
                                    key={bank.bankcode}
                                    className={`bank-option ${selectedBank === bank.bankcode ? 'selected' : ''}`}
                                    onClick={() => handleBankSelect(bank.bankcode)}
                                >
                                    <div className="option-radio">
                                        <div className={`radio-inner ${selectedBank === bank.bankcode ? 'checked' : ''}`}></div>
                                    </div>
                                    <div className="option-name">
                                        {bank.name}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PaymentMethod; 
