"use client";

import { useState } from "react";
import Image from "next/image";
import { Email, mockEmails } from "@/data/emails";

interface DecoyEmailProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function DecoyEmail({ isVisible, onClose }: DecoyEmailProps) {
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [activeCategory, setActiveCategory] = useState<'primary' | 'social' | 'promotions' | 'updates' | 'forums'>('primary');
  const [emails, setEmails] = useState<Email[]>(mockEmails);
  const [searchQuery, setSearchQuery] = useState("");

  const handleEmailClick = (email: Email) => {
    setSelectedEmail(email);
    setEmails(prev => prev.map(e => 
      e.id === email.id ? { ...e, isRead: true } : e
    ));
  };

  const handleBackToInbox = () => {
    setSelectedEmail(null);
  };

  // Filter emails by category
  const filteredEmails = emails.filter(email => email.category === activeCategory);
  const unreadCount = filteredEmails.filter(email => !email.isRead).length;

  if (!isVisible) return null;

  // CSS Reset styles to override global.css
  const resetStyles = {
    all: 'initial' as const,
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
    backgroundColor: '#f6f8fc',
    fontFamily: "'Google Sans', 'Roboto', sans-serif",
    fontSize: '14px',
    lineHeight: '1.4',
    color: '#202124',
    overflow: 'hidden' as const,
    boxSizing: 'border-box' as const
  };

  const buttonResetStyles = {
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    color: 'inherit',
    margin: 0,
    padding: 0,
    outline: 'none'
  };

  const inputResetStyles = {
    border: 'none',
    outline: 'none',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    backgroundColor: 'transparent',
    margin: 0,
    padding: 0
  };

  return (
    <div style={resetStyles}>
      <div className="w-full h-full" style={{ 
        fontFamily: "'Google Sans', 'Roboto', sans-serif",
        fontSize: '14px',
        lineHeight: '1.4',
        color: '#202124',
        boxSizing: 'border-box',
        margin: 0,
        padding: 0
      }}>
        {/* Gmail Header */}
        <div style={{
          backgroundColor: 'white',
          borderBottom: '1px solid #dadce0',
          padding: '8px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          boxSizing: 'border-box'
        }}>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            {/* Gmail Logo */}
            <div className="flex items-center relative">
              <Image 
                src="/gmail-logo.png" 
                alt="Gmail Logo" 
                width={100} 
                height={100}
                className="object-contain"
              />
              <span className="text-2xl text-[#5f6368] font-normal absolute left-8 ml-1">Gmail</span>
            </div>
          </div>
          {selectedEmail && (
            <button 
              onClick={handleBackToInbox}
              className="bg-[#1a73e8] hover:bg-[#1557b0] text-white px-4 py-2 rounded-md text-sm transition-colors flex items-center space-x-2 shadow-sm"
              style={{
                ...buttonResetStyles,
                backgroundColor: '#1a73e8',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                transition: 'all 0.2s ease'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
              </svg>
              <span>Back</span>
            </button>
          )}
        </div>
        
        {/* Gmail Search Bar */}
        <div className="flex-1 max-w-2xl mx-8">
          <div className="relative">
            <div className="flex items-center bg-[#f1f3f4] hover:bg-white hover:shadow-lg transition-all rounded-full px-4 py-3 border border-transparent hover:border-[#dadce0]">
              <svg width="20" height="20" viewBox="0 0 24 24" className="text-[#5f6368] mr-3">
                <path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
              <input 
                type="text"
                placeholder="Search mail"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-[#3c4043] placeholder-[#5f6368] text-sm"
                style={{
                  ...inputResetStyles,
                  flex: 1,
                  color: '#3c4043',
                  fontSize: '14px',
                  lineHeight: '1.4'
                }}
              />
              <div className="flex items-center space-x-2 ml-4">
                <button className="p-2 hover:bg-[#f8f9fa] rounded-full text-[#1a73e8] hover:text-[#1557b0]" style={{
                  ...buttonResetStyles,
                  padding: '8px',
                  borderRadius: '50%',
                  color: '#1a73e8',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Gmail Header Actions */}
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-[#f8f9fa] rounded-full transition-colors text-[#5f6368] hover:text-[#1a73e8]" style={{
            ...buttonResetStyles,
            padding: '8px',
            borderRadius: '50%',
            color: '#5f6368',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6,8c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM12,20c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM6,20c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM6,14c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM12,14c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM16,6c0,1.1 0.9,2 2,2s2,-0.9 2,-2 -0.9,-2 -2,-2 -2,0.9 -2,2zM12,8c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM18,14c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM18,20c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2z"/>
            </svg>
          </button>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#ea4335] hover:bg-[#d33b2c] transition-colors flex items-center justify-center"
            style={{
              ...buttonResetStyles,
              width: '32px',
              height: '32px',
              backgroundColor: '#ea4335',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" className="text-white">
              <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Gmail Content */}
      <div className="h-full bg-[#f6f8fc] flex">
        {!selectedEmail ? (
          <>
            {/* Gmail Sidebar */}
            <div className="w-64 bg-white border-r border-[#dadce0] flex-shrink-0 overflow-y-auto shadow-sm">
              {/* Compose Button */}
              <div className="p-4">
                <button className="w-full bg-[#c2e7ff] hover:bg-[#a8dadc] hover:shadow-md text-[#001d35] px-6 py-3 rounded-full text-sm font-medium transition-all flex items-center space-x-3 shadow-sm border border-[#a8dadc]" style={{
                  ...buttonResetStyles,
                  width: '100%',
                  backgroundColor: '#c2e7ff',
                  color: '#001d35',
                  padding: '12px 24px',
                  borderRadius: '50px',
                  fontSize: '14px',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  border: '1px solid #a8dadc',
                  transition: 'all 0.2s ease'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                  </svg>
                  <span>Compose</span>
                </button>
              </div>

              {/* Gmail Navigation */}
              <div className="px-2">
                {/* Inbox */}
                <button 
                  onClick={() => setActiveCategory('primary')}
                  className={`w-full text-left px-4 py-2 rounded-r-full transition-colors text-sm flex items-center justify-between ${
                    activeCategory === 'primary' 
                      ? 'bg-[#fce8e6] text-[#d93025] font-medium' 
                      : 'hover:bg-[#f8f9fa] text-[#3c4043]'
                  }`}
                  style={{
                    ...buttonResetStyles,
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 16px',
                    borderRadius: '0 50px 50px 0',
                    fontSize: '14px',
                    fontWeight: activeCategory === 'primary' ? 500 : 400,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: activeCategory === 'primary' ? '#fce8e6' : 'transparent',
                    color: activeCategory === 'primary' ? '#d93025' : '#3c4043',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                    </svg>
                    <span>Inbox</span>
                  </div>
                  {emails.filter(e => e.category === 'primary' && !e.isRead).length > 0 && (
                    <span className="text-xs font-medium">
                      {emails.filter(e => e.category === 'primary' && !e.isRead).length}
                    </span>
                  )}
                </button>

                {/* Starred */}
                <button className="w-full text-left px-4 py-2 rounded-r-full hover:bg-[#f8f9fa] text-[#3c4043] transition-colors text-sm flex items-center space-x-3" style={{
                  ...buttonResetStyles,
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 16px',
                  borderRadius: '0 50px 50px 0',
                  fontSize: '14px',
                  fontWeight: 400,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  backgroundColor: 'transparent',
                  color: '#3c4043',
                  transition: 'all 0.2s ease'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                  </svg>
                  <span>Starred</span>
                </button>

                {/* Snoozed */}
                <button className="w-full text-left px-4 py-2 rounded-r-full hover:bg-[#f8f9fa] text-[#3c4043] transition-colors text-sm flex items-center space-x-3" style={{
                  ...buttonResetStyles,
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 16px',
                  borderRadius: '0 50px 50px 0',
                  fontSize: '14px',
                  fontWeight: 400,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  backgroundColor: 'transparent',
                  color: '#3c4043',
                  transition: 'all 0.2s ease'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 11H7v6h2v-6zm4 0h-2v6h2v-6zm4 0h-2v6h2v-6zm2-7h-3V2h-2v2H8V2H6v2H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H3V9h14v11z"/>
                  </svg>
                  <span>Snoozed</span>
                </button>

                {/* Sent */}
                <button className="w-full text-left px-4 py-2 rounded-r-full hover:bg-[#f8f9fa] text-[#3c4043] transition-colors text-sm flex items-center space-x-3" style={{
                  ...buttonResetStyles,
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 16px',
                  borderRadius: '0 50px 50px 0',
                  fontSize: '14px',
                  fontWeight: 400,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  backgroundColor: 'transparent',
                  color: '#3c4043',
                  transition: 'all 0.2s ease'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                  </svg>
                  <span>Sent</span>
                </button>

                {/* Drafts */}
                <button className="w-full text-left px-4 py-2 rounded-r-full hover:bg-[#f8f9fa] text-[#3c4043] transition-colors text-sm flex items-center space-x-3" style={{
                  ...buttonResetStyles,
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 16px',
                  borderRadius: '0 50px 50px 0',
                  fontSize: '14px',
                  fontWeight: 400,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  backgroundColor: 'transparent',
                  color: '#3c4043',
                  transition: 'all 0.2s ease'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                  </svg>
                  <span>Drafts</span>
                </button>

                {/* Categories */}
                <div className="mt-4 border-t border-[#dadce0] pt-2">
                  <button 
                    onClick={() => setActiveCategory('social')}
                    className={`w-full text-left px-4 py-2 rounded-r-full transition-colors text-sm flex items-center justify-between ${
                      activeCategory === 'social' 
                        ? 'bg-[#fce8e6] text-[#d93025] font-medium' 
                        : 'hover:bg-[#f8f9fa] text-[#3c4043]'
                    }`}
                    style={{
                      ...buttonResetStyles,
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 16px',
                      borderRadius: '0 50px 50px 0',
                      fontSize: '14px',
                      fontWeight: activeCategory === 'social' ? 500 : 400,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: activeCategory === 'social' ? '#fce8e6' : 'transparent',
                      color: activeCategory === 'social' ? '#d93025' : '#3c4043',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                      <span>Social</span>
                    </div>
                    {emails.filter(e => e.category === 'social' && !e.isRead).length > 0 && (
                      <span className="text-xs font-medium">
                        {emails.filter(e => e.category === 'social' && !e.isRead).length}
                      </span>
                    )}
                  </button>

                  <button 
                    onClick={() => setActiveCategory('promotions')}
                    className={`w-full text-left px-4 py-2 rounded-r-full transition-colors text-sm flex items-center justify-between ${
                      activeCategory === 'promotions' 
                        ? 'bg-[#fce8e6] text-[#d93025] font-medium' 
                        : 'hover:bg-[#f8f9fa] text-[#3c4043]'
                    }`}
                    style={{
                      ...buttonResetStyles,
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 16px',
                      borderRadius: '0 50px 50px 0',
                      fontSize: '14px',
                      fontWeight: activeCategory === 'promotions' ? 500 : 400,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: activeCategory === 'promotions' ? '#fce8e6' : 'transparent',
                      color: activeCategory === 'promotions' ? '#d93025' : '#3c4043',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"/>
                      </svg>
                      <span>Promotions</span>
                    </div>
                    {emails.filter(e => e.category === 'promotions' && !e.isRead).length > 0 && (
                      <span className="text-xs font-medium">
                        {emails.filter(e => e.category === 'promotions' && !e.isRead).length}
                      </span>
                    )}
                  </button>

                  <button 
                    onClick={() => setActiveCategory('updates')}
                    className={`w-full text-left px-4 py-2 rounded-r-full transition-colors text-sm flex items-center justify-between ${
                      activeCategory === 'updates' 
                        ? 'bg-[#fce8e6] text-[#d93025] font-medium' 
                        : 'hover:bg-[#f8f9fa] text-[#3c4043]'
                    }`}
                    style={{
                      ...buttonResetStyles,
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 16px',
                      borderRadius: '0 50px 50px 0',
                      fontSize: '14px',
                      fontWeight: activeCategory === 'updates' ? 500 : 400,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: activeCategory === 'updates' ? '#fce8e6' : 'transparent',
                      color: activeCategory === 'updates' ? '#d93025' : '#3c4043',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                      </svg>
                      <span>Updates</span>
                    </div>
                    {emails.filter(e => e.category === 'updates' && !e.isRead).length > 0 && (
                      <span className="text-xs font-medium">
                        {emails.filter(e => e.category === 'updates' && !e.isRead).length}
                      </span>
                    )}
                  </button>

                  <button 
                    onClick={() => setActiveCategory('forums')}
                    className={`w-full text-left px-4 py-2 rounded-r-full transition-colors text-sm flex items-center justify-between ${
                      activeCategory === 'forums' 
                        ? 'bg-[#fce8e6] text-[#d93025] font-medium' 
                        : 'hover:bg-[#f8f9fa] text-[#3c4043]'
                    }`}
                    style={{
                      ...buttonResetStyles,
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 16px',
                      borderRadius: '0 50px 50px 0',
                      fontSize: '14px',
                      fontWeight: activeCategory === 'forums' ? 500 : 400,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: activeCategory === 'forums' ? '#fce8e6' : 'transparent',
                      color: activeCategory === 'forums' ? '#d93025' : '#3c4043',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                      </svg>
                      <span>Forums</span>
                    </div>
                    {emails.filter(e => e.category === 'forums' && !e.isRead).length > 0 && (
                      <span className="text-xs font-medium">
                        {emails.filter(e => e.category === 'forums' && !e.isRead).length}
                      </span>
                    )}
                  </button>
                </div>

                {/* More */}
                <div className="mt-4 border-t border-[#dadce0] pt-2">
                  <button className="w-full text-left px-4 py-2 rounded-r-full hover:bg-[#f8f9fa] text-[#3c4043] transition-colors text-sm flex items-center space-x-3" style={{
                    ...buttonResetStyles,
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 16px',
                    borderRadius: '0 50px 50px 0',
                    fontSize: '14px',
                    fontWeight: 400,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    backgroundColor: 'transparent',
                    color: '#3c4043',
                    transition: 'all 0.2s ease'
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/>
                    </svg>
                    <span>More</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Gmail Email List */}
            <div className="flex-1 bg-white">{/* previous content */}
              {/* Gmail Toolbar */}
              <div className="border-b border-[#dadce0] px-4 py-3 bg-white shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <input type="checkbox" className="rounded border-[#dadce0] text-[#1a73e8] focus:ring-[#1a73e8]" style={{
                      ...inputResetStyles,
                      borderRadius: '3px',
                      borderWidth: '1px',
                      borderColor: '#dadce0',
                      accentColor: '#1a73e8'
                    }} />
                    <button className="p-2 hover:bg-[#f8f9fa] rounded-full transition-colors text-[#5f6368] hover:text-[#1a73e8] hover:shadow-sm" style={{
                      ...buttonResetStyles,
                      padding: '8px',
                      borderRadius: '50%',
                      color: '#5f6368',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7 14l5-5 5 5z"/>
                      </svg>
                    </button>
                    <button className="p-2 hover:bg-[#f8f9fa] rounded-full transition-colors text-[#5f6368] hover:text-[#ea4335] hover:shadow-sm" style={{
                      ...buttonResetStyles,
                      padding: '8px',
                      borderRadius: '50%',
                      color: '#5f6368',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                      </svg>
                    </button>
                    <button className="p-2 hover:bg-[#f8f9fa] rounded-full transition-colors text-[#5f6368] hover:text-[#1a73e8] hover:shadow-sm" style={{
                      ...buttonResetStyles,
                      padding: '8px',
                      borderRadius: '50%',
                      color: '#5f6368',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM5 19V5h14v14H5z"/>
                      </svg>
                    </button>
                  </div>
                  <div className="flex items-center space-x-4 text-[#5f6368] text-sm">
                    <span className="font-medium">{filteredEmails.length > 0 ? `1-${filteredEmails.length}` : '0'} of {filteredEmails.length}</span>
                    <div className="flex items-center space-x-1">
                      <button className="p-1 hover:bg-[#f8f9fa] rounded transition-colors text-[#5f6368] hover:text-[#1a73e8]" style={{
                        ...buttonResetStyles,
                        padding: '4px',
                        borderRadius: '4px',
                        color: '#5f6368',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                        </svg>
                      </button>
                      <button className="p-1 hover:bg-[#f8f9fa] rounded transition-colors text-[#5f6368] hover:text-[#1a73e8]" style={{
                        ...buttonResetStyles,
                        padding: '4px',
                        borderRadius: '4px',
                        color: '#5f6368',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gmail Category Tabs */}
              <div className="border-b border-[#dadce0] bg-white">
                <div className="flex items-center w-full">
                  <button 
                    onClick={() => setActiveCategory('primary')}
                    className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeCategory === 'primary' 
                        ? 'border-[#1a73e8] text-[#1a73e8] bg-[#e8f0fe]' 
                        : 'border-transparent text-[#5f6368] hover:bg-[#f8f9fa]'
                    }`}
                    style={{
                      ...buttonResetStyles,
                      padding: '16px 32px',
                      fontSize: '16px',
                      fontWeight: 500,
                      borderBottom: activeCategory === 'primary' ? '3px solid #1a73e8' : '3px solid transparent',
                      backgroundColor: activeCategory === 'primary' ? '#e8f0fe' : 'transparent',
                      color: activeCategory === 'primary' ? '#1a73e8' : '#5f6368',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      flex: 1
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                    </svg>
                    Primary
                  </button>

                  <button 
                    onClick={() => setActiveCategory('social')}
                    className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeCategory === 'social' 
                        ? 'border-[#1a73e8] text-[#1a73e8] bg-[#e8f0fe]' 
                        : 'border-transparent text-[#5f6368] hover:bg-[#f8f9fa]'
                    }`}
                    style={{
                      ...buttonResetStyles,
                      padding: '16px 32px',
                      fontSize: '16px',
                      fontWeight: 500,
                      borderBottom: activeCategory === 'social' ? '3px solid #1a73e8' : '3px solid transparent',
                      backgroundColor: activeCategory === 'social' ? '#e8f0fe' : 'transparent',
                      color: activeCategory === 'social' ? '#1a73e8' : '#5f6368',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      flex: 1
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                    Social
                  </button>

                  <button 
                    onClick={() => setActiveCategory('promotions')}
                    className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeCategory === 'promotions' 
                        ? 'border-[#1a73e8] text-[#1a73e8] bg-[#e8f0fe]' 
                        : 'border-transparent text-[#5f6368] hover:bg-[#f8f9fa]'
                    }`}
                    style={{
                      ...buttonResetStyles,
                      padding: '16px 32px',
                      fontSize: '16px',
                      fontWeight: 500,
                      borderBottom: activeCategory === 'promotions' ? '3px solid #1a73e8' : '3px solid transparent',
                      backgroundColor: activeCategory === 'promotions' ? '#e8f0fe' : 'transparent',
                      color: activeCategory === 'promotions' ? '#1a73e8' : '#5f6368',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      flex: 1
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"/>
                    </svg>
                    Promotions
                  </button>

                  <button 
                    onClick={() => setActiveCategory('updates')}
                    className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeCategory === 'updates' 
                        ? 'border-[#1a73e8] text-[#1a73e8] bg-[#e8f0fe]' 
                        : 'border-transparent text-[#5f6368] hover:bg-[#f8f9fa]'
                    }`}
                    style={{
                      ...buttonResetStyles,
                      padding: '16px 32px',
                      fontSize: '16px',
                      fontWeight: 500,
                      borderBottom: activeCategory === 'updates' ? '3px solid #1a73e8' : '3px solid transparent',
                      backgroundColor: activeCategory === 'updates' ? '#e8f0fe' : 'transparent',
                      color: activeCategory === 'updates' ? '#1a73e8' : '#5f6368',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      flex: 1
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                    </svg>
                    Updates
                  </button>

                  <button 
                    onClick={() => setActiveCategory('forums')}
                    className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeCategory === 'forums' 
                        ? 'border-[#1a73e8] text-[#1a73e8] bg-[#e8f0fe]' 
                        : 'border-transparent text-[#5f6368] hover:bg-[#f8f9fa]'
                    }`}
                    style={{
                      ...buttonResetStyles,
                      padding: '16px 32px',
                      fontSize: '16px',
                      fontWeight: 500,
                      borderBottom: activeCategory === 'forums' ? '3px solid #1a73e8' : '3px solid transparent',
                      backgroundColor: activeCategory === 'forums' ? '#e8f0fe' : 'transparent',
                      color: activeCategory === 'forums' ? '#1a73e8' : '#5f6368',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      flex: 1
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                    </svg>
                    Forums
                  </button>
                </div>
              </div>

              {/* Email List */}
              <div className="overflow-y-auto" style={{ height: 'calc(100vh - 120px)' }}>
                {filteredEmails.map((email) => (
                  <div 
                    key={email.id}
                    onClick={() => handleEmailClick(email)}
                    className={`border-b border-[#f0f0f0] hover:shadow-sm cursor-pointer transition-all group ${
                      !email.isRead ? 'bg-white' : 'bg-white'
                    }`}
                  >
                    <div className="px-4 py-1">
                      <div className="flex items-center space-x-2">
                        {/* Checkbox */}
                        <input 
                          type="checkbox" 
                          className="rounded border-[#dadce0] opacity-0 group-hover:opacity-100 transition-opacity" 
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            ...inputResetStyles,
                            borderRadius: '3px',
                            borderWidth: '1px',
                            borderColor: '#dadce0',
                            accentColor: '#1a73e8',
                            opacity: 0
                          }}
                        />
                        
                        {/* Star */}
                        <button 
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-[#f8f9fa] rounded"
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            ...buttonResetStyles,
                            padding: '4px',
                            borderRadius: '4px',
                            color: '#5f6368',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: 0
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" className="text-[#5f6368]">
                            <path fill="currentColor" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                          </svg>
                        </button>

                        {/* Email Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              {/* Sender */}
                              <span className={`text-sm truncate ${
                                !email.isRead ? 'font-bold text-[#202124]' : 'font-normal text-[#5f6368]'
                              }`} style={{ minWidth: '120px', maxWidth: '180px' }}>
                                {email.sender.split('@')[0]}
                              </span>
                              
                              {/* Subject and Preview */}
                              <div className="flex-1 min-w-0">
                                <span className={`text-sm ${
                                  !email.isRead ? 'font-normal text-[#202124]' : 'text-[#5f6368]'
                                }`}>
                                  <span className={!email.isRead ? 'font-medium' : ''}>{email.subject}</span>
                                  <span className="text-[#5f6368] ml-2">- {email.preview}</span>
                                </span>
                              </div>
                            </div>
                            
                            {/* Time and Actions */}
                            <div className="flex items-center space-x-2 ml-4">
                              <span className="text-xs text-[#5f6368] whitespace-nowrap">
                                {email.time}
                              </span>
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
                                <button className="p-1 hover:bg-[#f8f9fa] rounded" onClick={(e) => e.stopPropagation()} style={{
                                  ...buttonResetStyles,
                                  padding: '4px',
                                  borderRadius: '4px',
                                  color: '#5f6368',
                                  transition: 'all 0.2s ease',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}>
                                  <svg width="16" height="16" viewBox="0 0 24 24" className="text-[#5f6368]">
                                    <path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM5 19V5h14v14H5z"/>
                                  </svg>
                                </button>
                                <button className="p-1 hover:bg-[#f8f9fa] rounded" onClick={(e) => e.stopPropagation()} style={{
                                  ...buttonResetStyles,
                                  padding: '4px',
                                  borderRadius: '4px',
                                  color: '#5f6368',
                                  transition: 'all 0.2s ease',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}>
                                  <svg width="16" height="16" viewBox="0 0 24 24" className="text-[#5f6368]">
                                    <path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          // Gmail Email Detail View
          <div className="flex-1 bg-[#f6f8fc] overflow-y-auto">
            <div className="max-w-4xl mx-auto p-6">
              {/* Email Header */}
              <div className="bg-white rounded-lg shadow-sm border border-[#dadce0] mb-6">
                <div className="border-b border-[#dadce0] p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h1 className="text-2xl font-normal text-[#202124] flex-1 pr-4">
                      {selectedEmail.subject}
                    </h1>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 hover:bg-[#f8f9fa] rounded-full transition-colors text-[#5f6368] hover:text-[#fbbc04]" style={{
                        ...buttonResetStyles,
                        padding: '8px',
                        borderRadius: '50%',
                        color: '#5f6368',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                        </svg>
                      </button>
                      <button className="p-2 hover:bg-[#f8f9fa] rounded-full transition-colors text-[#5f6368] hover:text-[#1a73e8]" style={{
                        ...buttonResetStyles,
                        padding: '8px',
                        borderRadius: '50%',
                        color: '#5f6368',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                        </svg>
                      </button>
                      <button className="p-2 hover:bg-[#f8f9fa] rounded-full transition-colors text-[#5f6368] hover:text-[#ea4335]" style={{
                        ...buttonResetStyles,
                        padding: '8px',
                        borderRadius: '50%',
                        color: '#5f6368',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                        </svg>
                      </button>
                      <button className="p-2 hover:bg-[#f8f9fa] rounded-full transition-colors text-[#5f6368] hover:text-[#1a73e8]" style={{
                        ...buttonResetStyles,
                        padding: '8px',
                        borderRadius: '50%',
                        color: '#5f6368',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Sender Info */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#4285f4] to-[#34a853] rounded-full flex items-center justify-center text-white font-medium text-sm shadow-sm">
                        {selectedEmail.sender.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-[#202124] text-sm">
                            {selectedEmail.sender.split('@')[0]}
                          </span>
                          <span className="text-[#5f6368] text-xs">
                            &lt;{selectedEmail.sender}&gt;
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-[#5f6368] mt-1">
                          <span>to me</span>
                          <button className="hover:bg-[#f8f9fa] px-1 rounded text-[#1a73e8] hover:text-[#1557b0]" style={{
                            ...buttonResetStyles,
                            padding: '2px 4px',
                            borderRadius: '4px',
                            color: '#1a73e8',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M7 14l5-5 5 5z"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-[#5f6368] font-medium">{selectedEmail.time}</div>
                      <button className="text-xs text-[#5f6368] hover:bg-[#f8f9fa] px-2 py-1 rounded flex items-center space-x-1 mt-1 hover:text-[#fbbc04] transition-colors">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                        </svg>
                        <span>Star</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Email Content */}
                <div className="p-6">
                  <div className="whitespace-pre-line text-[#202124] leading-relaxed text-sm font-normal">
                    {selectedEmail.content}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-4 p-6 pt-4 border-t border-[#dadce0]">
                  <button className="bg-[#1a73e8] hover:bg-[#1557b0] hover:shadow-md text-white px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center space-x-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z"/>
                    </svg>
                    <span>Reply</span>
                  </button>
                  <button className="border border-[#dadce0] hover:bg-[#f8f9fa] hover:shadow-sm text-[#3c4043] px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center space-x-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 8V4l8 8-8 8v-4H4V8z"/>
                    </svg>
                    <span>Forward</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
