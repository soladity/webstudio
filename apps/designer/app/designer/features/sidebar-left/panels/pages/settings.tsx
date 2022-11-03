import {
  IconButton,
  Button,
  Box,
  Label,
  TextField,
  styled,
  Flex,
  InputErrorsTooltip,
} from "@webstudio-is/design-system";
import { useFetcher } from "@remix-run/react";
import { ChevronDoubleLeftIcon, TrashIcon } from "@webstudio-is/icons";
import { utils as projectUtils } from "@webstudio-is/project";
import type { ZodError } from "zod";
import { Header } from "../../lib/header";
import { useState, useCallback } from "react";
import { type Page } from "@webstudio-is/project";
import { usePages } from "~/designer/shared/nano-states";
import { useDebounce, useUnmount } from "react-use";
import { useOnFetchEnd, usePersistentFetcher } from "~/shared/fetcher";
import {
  normalizeErrors,
  toastNonFieldErrors,
  useIds,
  useFetcherErrors,
} from "~/shared/form-utils";
import type {
  DeletePageData,
  EditPageData,
  CreatePageData,
} from "~/shared/pages";

const Group = styled(Flex, {
  marginBottom: "$3",
  gap: "$2",
  defaultVariants: { direction: "column" },
});

const fieldNames = ["name", "path"] as const;
type EditablePage = Pick<Page, typeof fieldNames[number]>;

const FormFields = ({
  disabled,
  values,
  onChange,
  fieldErrors,
}: {
  disabled?: boolean;
  values: EditablePage;
  onChange: <FieldName extends keyof EditablePage>(event: {
    field: FieldName;
    value: EditablePage[FieldName];
  }) => void;
  fieldErrors: ZodError["formErrors"]["fieldErrors"];
}) => {
  const fieldIds = useIds(fieldNames);

  return (
    <>
      <Group>
        <Label htmlFor={fieldIds.name} size={2}>
          Page Name
        </Label>
        <InputErrorsTooltip errors={fieldErrors.name}>
          <TextField
            state={fieldErrors.name && "invalid"}
            id={fieldIds.name}
            name="name"
            disabled={disabled}
            value={values?.name}
            onChange={(event) => {
              onChange({ field: "name", value: event.target.value });
            }}
          />
        </InputErrorsTooltip>
      </Group>
      <Group>
        <Label htmlFor={fieldIds.path} size={2}>
          Path
        </Label>
        <InputErrorsTooltip errors={fieldErrors.path}>
          <TextField
            state={fieldErrors.path && "invalid"}
            id={fieldIds.path}
            name="path"
            disabled={disabled}
            value={values?.path}
            onChange={(event) => {
              onChange({ field: "path", value: event.target.value });
            }}
          />
        </InputErrorsTooltip>
      </Group>
    </>
  );
};

export const NewPageSettings = ({
  onClose,
  onSuccess,
  projectId,
}: {
  onClose?: () => void;
  onSuccess?: (page: Page) => void;
  projectId: string;
}) => {
  const fetcher = useFetcher<CreatePageData>();

  useOnFetchEnd(fetcher, (data) => {
    if ("ok" in data) {
      onSuccess?.(data.page);
    }
  });

  const isSubmitting = fetcher.state !== "idle";

  const { fieldErrors, resetFieldError } = useFetcherErrors({
    fetcher,
    fieldNames,
  });

  const [values, setValues] = useState<EditablePage>({ name: "", path: "" });

  return (
    <>
      <Header
        title="New Page Settings"
        suffix={
          onClose && (
            <IconButton size="2" onClick={onClose} aria-label="Cancel">
              <ChevronDoubleLeftIcon />
            </IconButton>
          )
        }
      />
      <Box css={{ overflow: "auto", padding: "$2 $3" }}>
        <fetcher.Form method="put" action={`/rest/pages/${projectId}`}>
          <FormFields
            fieldErrors={fieldErrors}
            disabled={isSubmitting}
            values={values}
            onChange={({ field, value }) => {
              resetFieldError(field);
              setValues((values) => ({ ...values, [field]: value }));
            }}
          />
          <Group css={{ alignItems: "end" }}>
            <Button type="submit" variant="green" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create"}
            </Button>
          </Group>
        </fetcher.Form>
      </Box>
    </>
  );
};

const toFormData = (page: Partial<EditablePage> & { id: string }): FormData => {
  const formData = new FormData();
  for (const [key, value] of Object.entries(page)) {
    // @todo: handle "meta"
    if (typeof value === "string") {
      formData.append(key, value);
    }
  }
  return formData;
};

export const PageSettings = ({
  onClose,
  onDeleted,
  pageId,
  projectId,
}: {
  onClose?: () => void;
  onDeleted?: () => void;
  pageId: string;
  projectId: string;
}) => {
  const submitPersistently = usePersistentFetcher();

  const fetcher = useFetcher<EditPageData>();

  const [pages] = usePages();
  const page = pages && projectUtils.pages.findById(pages, pageId);
  const isHomePage = pageId === pages?.homePage.id;

  const [unsavedValues, setUnsavedValues] = useState<Partial<EditablePage>>({});
  const [submittedValues, setSubmittedValues] = useState<Partial<EditablePage>>(
    {}
  );

  const { fieldErrors, resetFieldError } = useFetcherErrors({
    fetcher,
    fieldNames,
  });

  const handleChange = useCallback(
    <FieldName extends keyof EditablePage>(event: {
      field: FieldName;
      value: EditablePage[FieldName];
    }) => {
      resetFieldError(event.field);
      setUnsavedValues((values) => ({ ...values, [event.field]: event.value }));
    },
    [resetFieldError]
  );

  useDebounce(
    () => {
      if (Object.keys(unsavedValues).length === 0) {
        return;
      }

      // We're re-submitting the submittedValues because previous submit is going to be cancelled
      // (normally, submittedValues are empty at this point)
      const valuesToSubmit = { ...submittedValues, ...unsavedValues };

      fetcher.submit(toFormData({ id: pageId, ...valuesToSubmit }), {
        method: "post",
        action: `/rest/pages/${projectId}`,
      });

      setSubmittedValues(valuesToSubmit);
      setUnsavedValues({});
    },
    1000,
    [unsavedValues]
  );

  useUnmount(() => {
    if (Object.keys(unsavedValues).length === 0) {
      return;
    }
    // We use submitPersistently instead of fetcher.submit
    // because we don't want the request to be canceled when the component unmounts
    submitPersistently<EditPageData>(
      toFormData({ id: pageId, ...submittedValues, ...unsavedValues }),
      { method: "post", action: `/rest/pages/${projectId}` },
      (data) => {
        if ("errors" in data) {
          toastNonFieldErrors(normalizeErrors(data.errors), []);
        }
      }
    );
  });

  useOnFetchEnd(fetcher, (data) => {
    if ("errors" in data) {
      setUnsavedValues({ ...submittedValues, ...unsavedValues });
    }
    setSubmittedValues({});
  });

  const hanldeDelete = () => {
    // We use submitPersistently instead of fetcher.submit
    // because we don't want the request to be canceled when the component unmounts
    submitPersistently<DeletePageData>(
      { id: pageId },
      { method: "delete", action: `/rest/pages/${projectId}` },
      (data) => {
        if ("errors" in data) {
          toastNonFieldErrors(normalizeErrors(data.errors), []);
        }
      }
    );
    onDeleted?.();
  };

  if (page === undefined) {
    return null;
  }

  return (
    <>
      <Header
        title="Page Settings"
        suffix={
          <>
            {isHomePage === false && (
              <IconButton
                size="2"
                onClick={hanldeDelete}
                aria-label="Delete page"
              >
                <TrashIcon />
              </IconButton>
            )}
            {onClose && (
              <IconButton
                size="2"
                onClick={onClose}
                aria-label="Close page settings"
              >
                <ChevronDoubleLeftIcon />
              </IconButton>
            )}
          </>
        }
      />
      <Box css={{ overflow: "auto", padding: "$2 $3" }}>
        <FormFields
          fieldErrors={fieldErrors}
          values={{ ...page, ...submittedValues, ...unsavedValues }}
          onChange={handleChange}
        />
      </Box>
    </>
  );
};
