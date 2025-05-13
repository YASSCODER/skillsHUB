import { Router } from 'express';
import EventController from "./event.controllers";
import catchAsync from "../../../common/utils/catch-async.utils";

const router = Router();

router.get('/', catchAsync(EventController.getAllEvents));
router.get('/:id', catchAsync(EventController.getEventById));
router.post('/', catchAsync(EventController.createEvent));
router.put('/:id', catchAsync(EventController.updateEvent));
router.delete('/:id', catchAsync(EventController.deleteEvent));
router.get('/community/:communityId', catchAsync(EventController.getEventsByCommunity));
router.get('/creator/:creatorId', catchAsync(EventController.getEventsByCreator));

export default router;