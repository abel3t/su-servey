import React, { useEffect, useState } from 'react';

import { Box, Button, CircularProgress, Dialog, DialogTitle } from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';

import { IGiftQuestion } from '../interfaces';
import GiftQuestion from '../components/GiftQuestion';
import { useDispatch, useSelector } from 'react-redux';
import { getGiftQuestions, updateGiftQuestion, updateGiftQuestions } from '../slices/gift.slice';
import Router from 'next/router';

const SpiritualGiftsSurvey: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [isSubmit, setIsSubmit] = useState(false);

  const giftQuestions = useSelector(getGiftQuestions);
  const dispatch = useDispatch();

  const MAX_PAGE = Math.ceil(giftQuestions.length / 10);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  useEffect(() => {
    const defaultQuestions = JSON.parse(localStorage.getItem('giftQuestions') || 'null');

    if (defaultQuestions) {
      dispatch(updateGiftQuestions(defaultQuestions.map((question: IGiftQuestion, index: number) => {
        return {
          ...question,
          text: giftQuestions[index].text
        }
      })));
    }
  }, []);

  const onClickPrev = () => {
    setCurrentPage(currentPage - 1);
  };

  const onClickNext = () => {
    setIsSubmit(false);

    let hasError = false;
    const newErrorMap: Record<string, boolean> = {};
    const result: Record<string, number> = {};
    giftQuestions
        .slice((currentPage - 1) * 10, currentPage * 10)
        .forEach((question: IGiftQuestion) => {
          if (!Number.isInteger(question.answer)) {
            hasError = true;
            newErrorMap[question.id] = true;
            dispatch(updateGiftQuestion({
              id: question.id,
              question: { hasError: true }
            }));
          } else {
            result[question.type] = (result[question.type] || 0) + (question.answer || 0);
          }
        });

    if (!hasError) {
      setCurrentPage(currentPage + 1);
    } else {
      setShowErrorDialog(true);
    }
  };

  const onClickSubmit = () => {
    setIsSubmit(true);

    let hasError = false;
    const result: Record<string, number> = {};
    giftQuestions.forEach((question: IGiftQuestion) => {
      if (question.answer === undefined) {
        hasError = true;
        dispatch(updateGiftQuestion({
          id: question.id,
          question: { hasError: true }
        }));
      } else {
        result[question.type] = (result[question.type] || 0) + question.answer;
      }
    });

    if (!hasError) {
      localStorage.setItem('giftQuestions', JSON.stringify(giftQuestions));
      localStorage.setItem('giftResult', JSON.stringify(result));

      Router.push('/spiritual-gifts').then(() => window.scrollTo(0, 0));
    } else {
      setShowErrorDialog(true);
      setIsSubmit(false);
    }
  };

  return (
      <div className="p-2 sm:p-3 md:p-4 lg:p-5 flex flex-col items-center bg-blue-200" style={{ minHeight: '100vh' }}>
        <div className="w-full md:w-3/4 lg:w-2/3 mb-3 border-gray-400 rounded-lg bg-white">
          <Box
              className="text-2xl md:text-3xl text-center text-white rounded-t-lg border-green-100 py-3 w-full"
              sx={{ bgcolor: 'primary.main' }}
          >
            Khảo Sát Ân Tứ
          </Box>
          <div className="p-2 md:p-3 lg:p-4 text-md">
            <p>Để giúp thiếu nhi có cái nhìn bao quát hơn về ân tứ của mình, khảo sát này có thể được thực hiện bởi thiếu
            nhi, phụ huynh và giáo viên của em đó.
            </p>
            <p className="mt-1">
              <i className="text-sm">Với mỗi câu dưới đây, hãy chọn số điểm tương ứng với khả năng của con trong việc mà
                câu đề cập. 5 điểm là điểm số cao nhất, 0 điểm là điểm số thấp nhất.</i>
            </p>
          </div>
        </div>

        {
          giftQuestions
              .slice((currentPage - 1) * 10, currentPage * 10)
              .map((question) =>
                  <GiftQuestion
                      key={question.id}
                      question={question}
                  />
              )
        }

        <div className="w-full md:w-3/4 lg:w-2/3 mb-3 border-gray-400 rounded-lg">
          {
              currentPage === 1 &&
              <Button variant="contained" onClick={onClickNext}>
                Tiếp theo
              </Button>
          }

          {
              currentPage > 1 && currentPage < MAX_PAGE &&
              <Box>
                <Button variant="contained" onClick={onClickPrev} sx={{ height: 35, minWidth: 60 }}>
                  Trở lại
                </Button>
                <Button variant="contained" onClick={onClickNext} style={{ marginLeft: 10, height: 35, minWidth: 60 }}>
                  Tiếp theo
                </Button>
              </Box>
          }

          {
              currentPage === MAX_PAGE &&
              <Box>
                <Button variant="contained" onClick={onClickPrev} sx={{ height: 35, minWidth: 60 }}>
                  Trở lại
                </Button>
                <>
                  {
                      isSubmit &&
                      <Button variant="contained" style={{ marginLeft: 15, height: 35, minWidth: 90 }}>
                        <CircularProgress sx={{ color: '#fff' }} size={25}/>
                      </Button>
                  }

                  {
                      !isSubmit &&
                      <Button variant="contained" onClick={onClickSubmit}
                              style={{ marginLeft: 15, height: 35, minWidth: 90 }}>
                        Gửi kết quả
                      </Button>
                  }
                </>
              </Box>
          }
        </div>

        <Dialog onClose={() => setShowErrorDialog(false)} open={showErrorDialog} sx={{ top: -400 }}>
          <DialogTitle className="text-md text-red-600"><ErrorIcon
              className="mr-2"/><span>Hãy trả lời tất cả câu hỏi nào!</span></DialogTitle>
        </Dialog>
      </div>
  );
};

export default SpiritualGiftsSurvey;
