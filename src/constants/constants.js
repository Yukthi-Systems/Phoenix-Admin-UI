/*
 * Copyright (C) 2026 Yukthi Systems Private Limited
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3
 * as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * version 3 along with this program. If not, see
 * <https://www.gnu.org/licenses/>.
 */

// Helper to retrieve environment variables: Runtime (window._env_) -> Build time (import.meta.env) -> Default
const getEnv = (key, defaultValue) => {
  if (typeof window !== "undefined" && window._env_ && window._env_[key]) {
    return window._env_[key];
  }
  return import.meta.env[key] || defaultValue;
};

export const PER_PAGE = 15;

// API Configuration
export const API_URL = getEnv("VITE_API_URL", "http://localhost:8000");

export const WSS_URL = getEnv("VITE_WSS_URL", "ws://localhost:8000");

export const BUILD_INFO = {
  version: getEnv("VITE_APP_VERSION", "1.1.9-phoenix"),
  buildDate: getEnv("VITE_BUILD_DATE", "03-01-2026"),
  environment: getEnv("VITE_ENVIRONMENT", "Development"),
  apiVersion: getEnv("VITE_API_VERSION", "1.7.2"),
  appName: getEnv("VITE_APP_NAME", "Admin Panel V3"),
  copyright: getEnv("VITE_COPYRIGHT", `© ${new Date().getFullYear()} Mail25`),
};

export const BASE_ORG = getEnv("VITE_BASE_ORG", "YSPL");

export const DNS_API_KEY = getEnv("VITE_DNS_API_KEY", "");

export const SERVER_ACTIONS = {
  REMOVE_MESSAGE: "rm_msg",
  CLEAR_QUEUE: "clear_queue",
  FLUSH_QUEUE: "flush_queue",
  HOLD_MESSAGE: "hold_msg",
  HOLD_ALL: "hold_all",
  REQUEUE_MESSAGE: "requeue_msg",
  REQUEUE_ALL: "requeue_all",
  RELEASE_ALL: "release_all",
};


export const APP_STORE_LINKS = {
  ios: "https://apps.apple.com/app/mail25/id0000000000",
  android: "https://play.google.com/store/apps/details?id=com.mail25.app",
};