import { useState } from "react";
import { Link, useNavigate } from "react-router";
import axios from "axios";

import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import { register } from "../../services/auth.service";

import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";

export default function SignUpForm() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");

    if (!isChecked) {
      setError("Please agree to the Terms and Conditions");
      return;
    }

    try {
      setLoading(true);

      const data = await register({
        fname,
        lname,
        email,
        phone,
        password,
      });

      console.log("REGISTER SUCCESS");
      console.log("Response:", data);

      navigate("/signin");
    } catch (error: unknown) {
      console.error(error);

      if (axios.isAxiosError(error)) {
        const responseData = error.response?.data;

        if (responseData?.errors) {
          const firstError = Object.values(
            responseData.errors
          )[0];

          if (Array.isArray(firstError)) {
            setError(String(firstError[0]));
          } else {
            setError(String(firstError));
          }
        } else {
          setError(
            responseData?.message ||
              "Something went wrong"
          );
        }
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar">
      <div className="w-full max-w-md mx-auto mb-5 sm:pt-10">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="size-5" />
          Back to dashboard
        </Link>
      </div>

      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign Up
            </h1>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Create your client account
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-5">

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <Label>
                    First Name
                    <span className="text-error-500">*</span>
                  </Label>

                  <Input
                    type="text"
                    value={fname}
                    onChange={(e) =>
                      setFname(e.target.value)
                    }
                    placeholder="Enter your first name"
                  />
                </div>

                <div>
                  <Label>
                    Last Name
                    <span className="text-error-500">*</span>
                  </Label>

                  <Input
                    type="text"
                    value={lname}
                    onChange={(e) =>
                      setLname(e.target.value)
                    }
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div>
                <Label>
                  Email
                  <span className="text-error-500">*</span>
                </Label>

                <Input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <Label>
                  Phone
                  <span className="text-error-500">*</span>
                </Label>

                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value)
                  }
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <Label>
                  Password
                  <span className="text-error-500">*</span>
                </Label>

                <div className="relative">
                  <Input
                    placeholder="Enter your password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                  />

                  <span
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                  >
                    {showPassword ? (
                      <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                    ) : (
                      <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                    )}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Checkbox
                  className="w-5 h-5"
                  checked={isChecked}
                  onChange={setIsChecked}
                />

                <p className="inline-block font-normal text-gray-500 dark:text-gray-400">
                  By creating an account means you
                  agree to the Terms and Conditions.
                </p>
              </div>

              {error && (
                <div className="text-sm text-error-500">
                  {error}
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:opacity-50"
                >
                  {loading
                    ? "Creating account..."
                    : "Sign Up"}
                </button>
              </div>
            </div>
          </form>

          <div className="mt-5">
            <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
              Already have an account?{" "}
              <Link
                to="/signin"
                className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}