"use client";

import React from "react";
import { ShieldAlert, Plus, Radio, ArrowLeft, Users, Shield } from "lucide-react";
import { CrisisRoom, UserRole } from "@/lib/types";

interface NavbarProps {
  currentRoom: CrisisRoom | null;
  userRole?: UserRole;
  onSelectRole?: (role: UserRole) => void;
  onOpenCreateModal: () => void;
  onBackToRooms?: () => void;
  onOpenNewSOSModal?: () => void;
}

export function Navbar({
  currentRoom,
  userRole = "commander",
  onSelectRole,
  onOpenCreateModal,
  onBackToRooms,
  onOpenNewSOSModal,
}: NavbarProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Room Info */}
        <div className="flex items-center space-x-4">
          {currentRoom && onBackToRooms ? (
            <button
              onClick={onBackToRooms}
              className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              title="All Crisis Rooms"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : null}

          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-md bg-red-600 flex items-center justify-center text-white font-bold shadow-sm">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-gray-950 text-base tracking-tight">
                RescueGrid
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-mono font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200">
                FalkorDB Brain
              </span>
            </div>
          </div>

          {currentRoom && (
            <div className="hidden md:flex items-center space-x-2 pl-3 border-l border-gray-200">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Crisis Room:
              </span>
              <span className="text-sm font-semibold text-gray-900 truncate max-w-xs">
                {currentRoom.name}
              </span>
              <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                Live Sync
              </span>
            </div>
          )}
        </div>

        {/* Actions & Status */}
        <div className="flex items-center space-x-3">
          {/* Freedom of Role Switcher */}
          {onSelectRole && (
            <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200 text-xs">
              <button
                type="button"
                onClick={() => onSelectRole("commander")}
                className={`px-2.5 py-1 rounded-md font-medium transition-all flex items-center space-x-1 ${
                  userRole === "commander"
                    ? "bg-white text-gray-900 shadow-xs font-semibold"
                    : "text-gray-500 hover:text-gray-800"
                }`}
                title="Incident Commander: Full command control & Dispatch Agent oversight"
              >
                <span>⚡</span>
                <span className="hidden sm:inline">Commander</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectRole("ngo")}
                className={`px-2.5 py-1 rounded-md font-medium transition-all flex items-center space-x-1 ${
                  userRole === "ngo"
                    ? "bg-white text-blue-700 shadow-xs font-semibold"
                    : "text-gray-500 hover:text-gray-800"
                }`}
                title="NGO / Field Volunteer: Register boats, ambulances, supplies & report road status"
              >
                <span>🤝</span>
                <span className="hidden sm:inline">NGO / Field</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectRole("public")}
                className={`px-2.5 py-1 rounded-md font-medium transition-all flex items-center space-x-1 ${
                  userRole === "public"
                    ? "bg-white text-red-700 shadow-xs font-semibold"
                    : "text-gray-500 hover:text-gray-800"
                }`}
                title="Public Citizen: Emergency SOS broadcast & safe shelter lookup"
              >
                <span>🆘</span>
                <span className="hidden sm:inline">Citizen</span>
              </button>
            </div>
          )}

          <div className="hidden xl:flex items-center text-xs text-gray-500 font-mono space-x-1.5 mr-2">
            <Radio className="w-3.5 h-3.5 text-red-500" />
            <span>FalkorDB</span>
          </div>

          {currentRoom && onOpenNewSOSModal && (
            <button
              onClick={onOpenNewSOSModal}
              className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              New SOS Request
            </button>
          )}

          <button
            onClick={onOpenCreateModal}
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-gray-900 text-white hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4 mr-1" />
            Create Crisis Room
          </button>
        </div>
      </div>
    </header>
  );
}
