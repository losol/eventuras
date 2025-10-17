/* eslint no-process-env: 0 */

import { Logger } from '@eventuras/utils/src/Logger';
import dotenv from 'dotenv';

dotenv.config();

export const getTagAndNamespaceFromEmail = (email: string) => {
  // @ts-ignore
  const splitEmail: string[] = email.split('@')[0].split('.');
  return { nameSpace: splitEmail[0], tag: splitEmail[1] };
};
export const fetchLoginCode = async (userEmail: string) => {
  Logger.info({ namespace: 'tests.utils' }, `Fetching login code for user ${userEmail}`);
  const APIKEY = process.env.TEST_EMAIL_APP_API_KEY;
  const tagAndNs = getTagAndNamespaceFromEmail(userEmail);
  const result = await fetch(
    `${process.env.TEST_EMAIL_APP_API_URL}/api/json?apikey=${APIKEY}&namespace=${
      tagAndNs.nameSpace
    }&tag=${tagAndNs.tag}&limit=1&livequery=true&timestamp_from=${Date.now()}`
  ).then(r => r.json());
  if (result.emails.length === 0) {
    throw new Error(`No emails received for user ${userEmail}`);
  }
  let loginCode: string | null = null;
  try {
    loginCode = result.emails[0].text.split('Your verification code is: ')[1].split('\n')[0];
  } catch (e: any) {
    throw new Error('No login code found in email');
  }
  Logger.info(
    { namespace: 'tests.utils', developerOnly: true },
    `Code fetched succesfully: ${loginCode}`
  );
  return loginCode;
};
