import React, { useEffect, useState } from "react";
import "./IdPassportVerification.scss";
import { CountryDropdown } from "../../components/shared/CountryDropdown/CountryDropdown";
import { Button } from "../../components/shared/Button/Button";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getUserCountryDocument,
  updateUserCountryDocument,
} from "../../services/user.service";
import {
  UserCountryResponse,
  DocumentType,
  CountryCode,
} from "../../models/user.model";
import { DocumentTypeDropdown } from "../../components/shared/DocumentTypeDropdown/DocumentTypeDropdown";

export type IdPassportVerificationProps = {
  countryCodeSaved: () => void;
  goToPreviousStep: () => void;
};

export const IdPassportVerification = (
  props: IdPassportVerificationProps
): React.JSX.Element => {
  const { countryCodeSaved, goToPreviousStep } = props;
  const [countryCode, setCountryCode] = useState<CountryCode>();
  const [documentType, setDocumentType] = useState<DocumentType>();
  const [isCodeInvalid, setIsCodeInvalid] = useState<boolean>(false);
  const [isTypeInvalid, setIsTypeInvalid] = useState<boolean>(false);
  const {
    data: countryData,
    isRefetching,
    isLoading,
    refetch: refetchCountry,
  } = useQuery<UserCountryResponse | null, Error>({
    queryKey: ["getUserCountryDocument"],
    queryFn: getUserCountryDocument,
    enabled: false,
  });
  const updateUserRequest = useMutation({
    mutationFn: updateUserCountryDocument,
    onSuccess: (data) => {
      if (data?.country_code && data?.document_type) {
        countryCodeSaved && countryCodeSaved();
      }
    },
  });

  useEffect(() => {
    refetchCountry();
  }, []);

  const handleNextClick = () => {
    if (!countryCode) {
      setIsCodeInvalid(true);
      return;
    }

    if (!documentType) {
      setIsTypeInvalid(true);
      return;
    }

    updateUserRequest.mutate({ countryCode, documentType });
  };

  const handleCountryCodeChange = (value: CountryCode) => {
    setIsCodeInvalid(false);
    setCountryCode(value);
  };

  const handleDocumentTypeChange = (value: DocumentType) => {
    setIsTypeInvalid(false);
    setDocumentType(value);
  };

  return isRefetching || isLoading ? (
    <></>
  ) : (
    <div className="IdPassportVerification ColumnCenterSpaceBetween">
      <div className="SectionHeader">
        <h1>ID / Passport Verification</h1>
        <p>Please select the country where your ID document was issued.</p>
        <CountryDropdown
          onCountryChange={handleCountryCodeChange}
          country={countryData?.country}
          markAsInvalid={isCodeInvalid}
        />
        <DocumentTypeDropdown
          onTypeChange={handleDocumentTypeChange}
          type={countryData?.documentType}
          markAsInvalid={isTypeInvalid}
        />
      </div>

      <div className="ColumnActions">
        <Button onClick={handleNextClick}>Next</Button>
        {/*<Button style="secondary" onClick={goToPreviousStep}>*/}
        {/*  Back*/}
        {/*</Button>*/}
      </div>
    </div>
  );
};
