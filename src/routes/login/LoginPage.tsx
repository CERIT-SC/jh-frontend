/**
 * @fileoverview Thin login resolver: explicit `instance.pages.login` content
 * renders through the shared LoginCard; without it the active brand's login
 * slot renders (today's origin page). Props unchanged ({ buttonText, link }).
 */

import React from "react";
import { P } from "@e-infra/design-system";
import type { LoginPageProps } from "../../brands/types";
import { getBrand } from "../../brands/registry";
import { getInstanceConfig } from "@utils/instanceConfig";
import { LoginCard } from "./components/LoginCard";

const LoginPage: React.FC<LoginPageProps> = ({ buttonText, link }) => {
  const login = getInstanceConfig().config.pages.login;

  if (login) {
    return (
      <LoginCard
        heading={login.heading}
        subtitle={login.subtitle}
        logo={login.logo}
        info={
          login.paragraphs.length > 0 ? (
            <>
              {login.paragraphs.map((text, index) => (
                <P key={index} className="text-center text-sm leading-relaxed">
                  {text}
                </P>
              ))}
            </>
          ) : undefined
        }
        links={login.links.map((entry) => ({
          label: entry.label,
          href: entry.href,
        }))}
        buttonText={login.button_text}
        link={link}
      />
    );
  }

  const BrandLoginPage = getBrand().slots.LoginPage;
  return <BrandLoginPage buttonText={buttonText} link={link} />;
};

export default LoginPage;
