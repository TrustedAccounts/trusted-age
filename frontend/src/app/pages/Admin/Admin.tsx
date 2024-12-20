import React, { useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getPassportImageData,
  getPendingUsers,
  updateUserRequest,
} from "../../services/user.service";
import "./Admin.scss";
import { COUNTRIES } from "../../components/shared/CountryDropdown/countries";
import { Button } from "../../components/shared/Button/Button";
import close from "../../../assets/icons/close-blue.svg";
import check from "../../../assets/icons/check-white.svg";
import avatar from "../../../assets/icons/user-blue.svg";
import { Modal } from "../../components/shared/Modal/Modal";

export const Admin = (): React.JSX.Element => {
  const {
    isLoading,
    data: userList,
    refetch: refetchList,
  } = useQuery({
    queryKey: ["getPendingUsers"],
    queryFn: getPendingUsers,
    enabled: true,
  });

  const [currentUserId, setCurrentUserId] = React.useState<string | null>(null);
  const [imageModalOpened, setImageModalOpened] = React.useState(false);
  const [showLivenessImage, setShowLivenessImage] = React.useState(false);
  const [modalImage, setModalImage] = React.useState<string>();

  const {
    isRefetching: passportImageLoading,
    isLoading: userImageLoading,
    data: userImageData,
    refetch: userDocsRefetch,
  } = useQuery({
    queryKey: ["getAdminData"],
    queryFn: () => getPassportImageData(currentUserId || ""),
    enabled: false,
  });

  const updateUserRequestMutation = useMutation({
    mutationFn: updateUserRequest,
    onSuccess: () => {
      refetchList();
    },
  });

  useEffect(() => {
    if (currentUserId) {
      userDocsRefetch();
    }
  }, [currentUserId]);

  useEffect(() => {
    if (userImageData) {
      setModalImage(
        showLivenessImage
          ? userImageData.faceImage
          : userImageData.passportImage
      );
    } else {
      setModalImage(undefined);
    }
  }, [userImageData, showLivenessImage]);

  const getCountryData = (countryCode?: string) => {
    return COUNTRIES.find((country) => country.value === countryCode);
  };

  const openUserImage = (userId: string, showLivenessPhoto: boolean) => {
    setCurrentUserId(userId);
    setShowLivenessImage(showLivenessPhoto);
    setImageModalOpened(true);
  };

  const onModalClose = () => {
    setImageModalOpened(false);
    setModalImage(undefined);
  };

  const handleUserRequestUpdate = (userId: string, approved: boolean) => {
    updateUserRequestMutation.mutate({ userId, approved });
  };

  return isLoading || !userList ? (
    <></>
  ) : (
    <>
      <Modal
        opened={imageModalOpened}
        closeModal={onModalClose}
        modalImage={modalImage}
        loading={passportImageLoading || userImageLoading}
      />
      <div className="Admin">
        <h1>Pending Verification Requests</h1>
        <div className="list Column">
          {!userList.length && (
            <div className="empty">You have no pending requests</div>
          )}
          {userList.map((item) => {
            return (
              <div className="request-card" key={item._id}>
                <div className="Row">
                  <div className="avatar">
                    <img src={avatar} width={36} alt="close" />
                  </div>
                  <div>
                    <p>
                      {getCountryData(item.country_code)?.label}{" "}
                      {getCountryData(item.country_code)?.flag}
                    </p>
                    {item.age && <p>{item.age} years old</p>}
                  </div>
                </div>
                <div className="Row card-body">
                  <div className="Column details">
                    <p onClick={() => openUserImage(item._id, false)}>
                      See document
                    </p>
                    <p onClick={() => openUserImage(item._id, true)}>
                      See Liveness check photo
                    </p>
                  </div>
                  <div className="actions">
                    <Button
                      onClick={() => handleUserRequestUpdate(item._id, false)}
                      isDisabled={updateUserRequestMutation.isPending}
                      style="outlined"
                    >
                      <img src={close} width={24} alt="close" />
                      Reject
                    </Button>

                    <Button
                      onClick={() => handleUserRequestUpdate(item._id, true)}
                      isDisabled={updateUserRequestMutation.isPending}
                    >
                      <img src={check} width={24} alt="checkmark" />
                      Approve
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};
