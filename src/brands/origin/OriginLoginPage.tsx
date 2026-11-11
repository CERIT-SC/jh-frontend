/**
 * @fileoverview The origin brand's LoginPage — moved verbatim from
 * `routes/login/LoginPage.tsx` (docs URL and logos now from brand data; the
 * MetaCentrum membership links are origin-specific and stay in the slot).
 *
 * The card layout lives in the shared `LoginCard`; this slot only supplies
 * the origin's content (logos, membership info, quick links).
 */

import React from "react";
import { Button, P } from "@e-infra/design-system";
import { BookOpen, Users } from "lucide-react";
import { originCopy, originLogos } from "./copy";
import type { LoginPageProps } from "../types";
import { LoginCard } from "../../routes/login/components/LoginCard";

export const OriginLoginPage: React.FC<LoginPageProps> = ({
  buttonText,
  link,
}) => {
  return (
    <LoginCard
      heading="Welcome to JupyterHub"
      subtitle="Sign in to access your JupyterHub workspace"
      logo={{
        src: originLogos.light,
        dark_src: originLogos.dark,
        alt: "e-INFRA CZ",
      }}
      info={
        <P className="text-center text-sm leading-relaxed">
          You need to be a valid member of{" "}
          <Button
            variant="ghost"
            size="sm"
            className="h-auto px-1 py-0 text-sm font-normal text-primary underline-offset-4 hover:underline"
            onClick={() => {
              window.location.href =
                "https://profile.e-infra.cz/profile/organizations";
            }}
          >
            MetaCentrum
          </Button>{" "}
          to access JupyterHub.
        </P>
      }
      links={[
        {
          label: "Check membership",
          href: "https://docs.cerit.io/en/docs/platform/access#account",
          icon: <Users className="h-5 w-5 shrink-0" />,
        },
        {
          label: "Documentation",
          href: originCopy.docs_url,
          icon: <BookOpen className="h-5 w-5 shrink-0" />,
        },
      ]}
      buttonText={buttonText}
      link={link}
    />
  );
};
