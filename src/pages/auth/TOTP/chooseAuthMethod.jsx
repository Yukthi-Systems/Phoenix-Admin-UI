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

import { itemsAtom } from "@/store/tfaMethods";
import { useAtomValue } from "jotai";
import { Zap } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const methodLabels = {
  totp: "Authenticator App",
  email: "Email",
  sms: "SMS",
};

function ChooseAuthMethod() {
  const tFAItems = useAtomValue(itemsAtom);
  const navigate = useNavigate();
  const location = useLocation();
  const availableMethods = location.state?.availableMethods || tFAItems || [];
  const user = location.state?.user || "";
  const redirectPath = location.state?.redirectPath || "/";
  const [selectedType, setSelectedType] = useState(availableMethods[0] || "");

  const handleVerifyClick = () => {
    if (selectedType) {
      navigate(`/2fa/validate/${selectedType}`, {
        state: {
          user: user,
          redirectPath: redirectPath, // Pass redirect path to the selected 2FA method
        },
      });
    }
  };

  return (
    <div className="w-full h-screen flex justify-center items-center bg-background text-foreground">
      <div className="w-full max-w-md bg-card p-6 shadow-lg rounded-xl">
        <div className="mx-auto mb-6 w-20 h-20 bg-primary/20 rounded-full flex justify-center items-center text-primary">
          <Zap size={45} />
        </div>
        <h2 className="text-2xl font-semibold text-center mb-4">
          Select Authentication Method
        </h2>

        <div className="flex flex-col gap-3">
          {availableMethods.map((method) => (
            <label
              key={method}
              htmlFor={method}
              className={`cursor-pointer p-3 border-2 rounded flex items-center gap-3 transition-all
                ${
                  selectedType === method
                    ? "bg-primary/30 border-primary text-foreground"
                    : "border-gray-300 hover:border-primary/60"
                }`}
            >
              <input
                id={method}
                type="radio"
                value={method}
                checked={selectedType === method}
                onChange={() => setSelectedType(method)}
                className="accent-primary"
              />
              <span className="ml-2">{methodLabels[method] || method}</span>
            </label>
          ))}
        </div>

        <button
          onClick={handleVerifyClick}
          disabled={!selectedType}
          className="mt-6 w-full bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
        >
          Continue
        </button>

        <div className="mt-4 text-center text-sm text-gray-500">
          <p>
            Lost access to your authenticator?{" "}
            <Link
              to="/2fa/backup-code-login"
              state={{ redirectPath }}
              className="text-blue-500 hover:underline"
            >
              Use backup code
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ChooseAuthMethod;
