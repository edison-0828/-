package vip.xiaonuo.zj.modular.viewing.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;
import vip.xiaonuo.auth.core.util.StpClientUtil;
import vip.xiaonuo.common.exception.CommonException;
import vip.xiaonuo.zj.modular.listing.entity.ZjListing;
import vip.xiaonuo.zj.modular.listing.service.ZjListingService;
import vip.xiaonuo.zj.modular.viewing.entity.ZjViewingRequest;
import vip.xiaonuo.zj.modular.viewing.mapper.ZjViewingRequestMapper;
import vip.xiaonuo.zj.modular.viewing.param.ZjViewingCreateParam;
import vip.xiaonuo.zj.modular.viewing.service.ZjViewingRequestService;

import java.util.List;

@Service
public class ZjViewingRequestServiceImpl extends ServiceImpl<ZjViewingRequestMapper, ZjViewingRequest>
        implements ZjViewingRequestService {

    @Resource
    private ZjListingService listingService;

    @Override
    public String create(ZjViewingCreateParam param) {
        ZjListing listing = listingService.publicDetail(param.getListingId());
        String requesterId = StpClientUtil.getLoginIdAsString();
        if (requesterId.equals(listing.getPublisherId())) throw new CommonException("不能预约自己发布的房源");
        ZjViewingRequest request = new ZjViewingRequest();
        request.setListingId(param.getListingId());
        request.setRequesterId(requesterId);
        request.setPreferredDate(param.getPreferredDate());
        request.setPreferredTime(param.getPreferredTime());
        request.setContactPhone(param.getContactPhone());
        request.setMessage(param.getMessage());
        request.setStatus("PENDING");
        this.save(request);
        return request.getId();
    }

    @Override
    public List<ZjViewingRequest> mine() {
        return this.list(new LambdaQueryWrapper<ZjViewingRequest>()
                .eq(ZjViewingRequest::getRequesterId, StpClientUtil.getLoginIdAsString())
                .orderByDesc(ZjViewingRequest::getCreateTime));
    }
}
