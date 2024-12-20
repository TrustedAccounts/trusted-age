import { Button } from "../Button/Button";
import closeWhite from "../../../../assets/icons/close.svg";
import React from "react";
import "./Modal.scss";
import { Loader } from "@aws-amplify/ui-react";

type ModalProps = {
  opened: boolean;
  closeModal: () => void;
  modalImage?: string;
  loading?: boolean;
};

export const Modal = ({
  opened,
  closeModal,
  modalImage,
  loading,
}: ModalProps) => {
  return opened ? (
    <div className="ImageModal Row">
      {loading ? (
        <Loader />
      ) : (
        <>
          <Button style="ghost" onClick={closeModal}>
            <img src={closeWhite} width={32} alt="close" />
          </Button>
          {modalImage ? (
            <img src={modalImage} />
          ) : (
            <div className="NoImage">Image not found or missing</div>
          )}
        </>
      )}
    </div>
  ) : null;
};
