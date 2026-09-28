import _ from 'lodash';

export const isValidEmail = (email) => {
   // eslint-disable-next-line sonarjs/cognitive-complexity, security/detect-regex-lite
   const match = String(email)
      .toLowerCase()
      .match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/);
   return !!match;
};

export const validateUrl = (url) => {
   const urlRegex = /^(http(s)?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.){+,}[a-zA-Z]{2,}(\.[a-zA-Z]{2,})?$/;

   return urlRegex.test(url);
};

export const isValidJSON = (value) => {
   try {
      if (_.isEmpty(value)) {
         return false;
      }

      JSON.parse(value);
      return true;
   } catch (e) {
      return false;
   }
};
