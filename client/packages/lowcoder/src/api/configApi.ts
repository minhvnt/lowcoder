import Api from "./api";
import { AxiosPromise } from "axios";
import { ApiResponse } from "./apiResponses";
import { ConfigResponseData } from "constants/configConstants";

export interface ConfigResponse extends ApiResponse {
  data: ConfigResponseData;
}

class ConfigApi extends Api {
  static configURL = "/configs";

  static fetchConfig(orgId?: string): AxiosPromise<ConfigResponse> {
    let authConfigURL = ConfigApi.configURL;
    if(orgId?.length) {
      authConfigURL += `?orgId=${orgId}`;
    }
    console.log('authConfigURL:', authConfigURL);
    return Api.get(authConfigURL);
  }

  static fetchDeploymentId(): AxiosPromise<ConfigResponse> {
    return Api.get(`${ConfigApi.configURL}/deploymentId`);
  }
}

export default ConfigApi;
