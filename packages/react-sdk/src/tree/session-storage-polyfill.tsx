// This is a temporary work around for https://github.com/remix-run/remix/issues/3659

// The code is based on this discussion https://bugs.chromium.org/p/chromium/issues/detail?id=357625
const polyfill = function () {
  // run only if we're in an iframe
  if (window.location === window.parent.location) {
    return;
  }

  try {
    const key = "__session_storage_availability_test__";
    sessionStorage.setItem(key, "test"); // test
    sessionStorage.removeItem(key); // cleanup
  } catch (error) {
    alert(
      'It looks like you have disabled cookies in your browser. Webstudio designer may not work properly.\n\nTo enable cookies, go to "Setting" > "Privacy and security" > "Cookies and other site data", and make sure neither "Block all cookies" nor "Block third-party cookies" are selected.\n\nRead more at https://support.google.com/chrome/answer/95647'
    );
    const data = new Map();
    Object.defineProperty(window, "sessionStorage", {
      value: {
        setItem: (key: string, val: unknown) => {
          // eslint-disable-next-line no-console
          console.warn(
            `Session storage is unavailable due to Error "${
              (error as Error).message
            }". A polyfill is used to set value of "${key}". The value will be lost when the page is reloaded.`
          );
          data.set(key, String(val));
        },
        getItem: (key: string) => {
          return data.get(key);
        },
        removeItem: (key: string) => {
          data.delete(key);
        },
        clear: () => {
          data.clear();
        },
      },
    });
  }
}.toString();

export const SessionStoragePolyfill = () => (
  <script dangerouslySetInnerHTML={{ __html: `(${polyfill})()` }} />
);
