import { ThirdPartyConfigType } from "constants/authConstants";
import { QR_CODE_OAUTH_URL } from "constants/routesURL";
import { UserConnectionSource } from "@lowcoder-ee/constants/userConstants";
import { GeneralLoginIcon } from "assets/icons";
import {
  isRouteLink,
  ServerAuthType,
  ServerAuthTypeInfo,
} from "@lowcoder-ee/constants/authConstants";

interface FeatureFlag {
  enableCustomBranding: boolean;
  enableEnterpriseLogin: boolean;
  enableAuditLog: boolean;
}

export interface BrandingConfig {
  logo?: string;
  favicon?: string;
  brandName?: string;
  headerColor?: string;
}

export type ConfigBaseInfo = {
  selfDomain: boolean;
  cloudHosting: boolean;
  workspaceMode: "SAAS" | "ENTERPRISE" | "MULTIWORSPACE" | "SINGLEWORKSPACE";
  warning?: string;
  featureFlag: FeatureFlag;
  branding?: BrandingConfig;
};

type OAuthConfig = {
  authorizeUrl: string;
  authType: ServerAuthType;
  source: string;
  sourceName: string;
  sourceIcon?: string;
  agentId?: string;
  clientId?: string;
  id?: string;
};

export type FormConfig = {
  enableRegister?: boolean;
  enable?: boolean;
  authType: ServerAuthType;
  sourceIcon?: string;
  source: string;
  sourceName: string;
  id?: string;
};

export type AuthConfigType = OAuthConfig | FormConfig;

export type ConfigResponseData = {
  authConfigs?: AuthConfigType[];
} & ConfigBaseInfo;

function isOAuthConfig(config: AuthConfigType): config is OAuthConfig {
  return !!ServerAuthTypeInfo[config.authType]?.isOAuth2;
}

export type SystemConfig = {
  form: {
    enableRegister: boolean;
    enableLogin: boolean;
    id?: string;
    type: "EMAIL" | "PHONE";
  };
  authConfigs: ThirdPartyConfigType[];
} & ConfigBaseInfo;

// xu ly du lieu cau hinh tra ve tu server
export const transToSystemConfig = (responseData: ConfigResponseData): SystemConfig => {
  const thirdPartyAuthConfigs: ThirdPartyConfigType[] = [];
  responseData.authConfigs?.forEach((authConfig) => {

    const logo = ServerAuthTypeInfo[authConfig.authType]?.logo || GeneralLoginIcon;
    var icon = "";
    if (authConfig.authType === "GENERIC" && authConfig.sourceIcon) {
      icon = authConfig.sourceIcon;
    }

    if (isOAuthConfig(authConfig)) {
      const routeLinkConf: Partial<ThirdPartyConfigType> = isRouteLink(authConfig.authType)
        ? {
            url: QR_CODE_OAUTH_URL,
            routeLink: true,
          }
        : {};
      thirdPartyAuthConfigs.push({
        logo: logo,
        icon: icon,
        name: authConfig.sourceName,
        url: authConfig.authorizeUrl,
        sourceType: authConfig.source,
        authType: "OAUTH2",
        clientId: authConfig.clientId,
        agentId: authConfig.agentId,
        id: authConfig.id,
        ...routeLinkConf,
      });
    }
  });
  const emailConfig = responseData.authConfigs?.find(
    (c) => c.source === UserConnectionSource.email
  ) as FormConfig | undefined;

  const tmp = {
    ...responseData,
    form: {
      enableRegister: !!emailConfig?.enableRegister,
      enableLogin: !!emailConfig?.enable,
      id: emailConfig?.id,
      type: "EMAIL",
    },
    authConfigs: thirdPartyAuthConfigs,
  };
  console.log('AuthContext login:', tmp);

  return {
    ...responseData,
    form: {
      enableRegister: !!emailConfig?.enableRegister,
      enableLogin: !!emailConfig?.enable,
      id: emailConfig?.id,
      type: "EMAIL",
    },
    authConfigs: thirdPartyAuthConfigs,
  };
};
