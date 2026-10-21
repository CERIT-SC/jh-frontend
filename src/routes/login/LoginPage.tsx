/**
 * @fileoverview Thin brand-slot resolver: renders the active brand's login
 * page. Props unchanged ({ buttonText, link }).
 */

import React from "react";
import type { LoginPageProps } from "../../brands/types";
import { getBrand } from "../../brands/registry";

const LoginPage: React.FC<LoginPageProps> = ({ buttonText, link }) => {
  const BrandLoginPage = getBrand().slots.LoginPage;
  return <BrandLoginPage buttonText={buttonText} link={link} />;
};

export default LoginPage;
