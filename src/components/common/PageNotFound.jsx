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

import PageNotFoundImg from "../../assets/Icons/page-not-found.svg";
import { Link } from "react-router-dom";
import { BackButton } from "./Buttons";
import { House } from "lucide-react";

function PageNotFound({ backbutton = true }) {
  return (
    <div className="w-full flex justify-center items-center h-screen bg-background">
      <div className="w-full max-w-4xl px-4 relative">
        <div className="text-center">
          <img
            src={PageNotFoundImg}
            className="h-[60vh] max-h-96 w-auto mx-auto mb-8"
            alt="Page not found illustration"
          />

          <div className="space-y-4 mb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground">
              404
            </h1>
            <h2 className="text-xl md:text-2xl font-semibold text-foreground">
              Page Not Found
            </h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-md mx-auto">
              Oops! The page you're looking for doesn't exist. It might have
              been moved, deleted, or you entered the wrong URL.
            </p>
          </div>

          <div className="flex justify-center gap-4 items-center flex-wrap">
            {backbutton && <BackButton />}
            <Link to="/">
              <button className="text-primary-foreground px-4 py-2 flex gap-2 items-center text-sm font-medium rounded-md bg-primary hover:bg-primary/90 cursor-pointer transition-colors">
                <House size={18} />
                Go to Dashboard
              </button>
            </Link>
          </div>

          {/* <div className="mt-8">
            <p className="text-sm text-muted-foreground">
              Need help? <Link to="/support" className="text-primary hover:underline">Contact Support</Link>
            </p>
          </div> */}
        </div>
      </div>
    </div>
  );
}

export default PageNotFound;
