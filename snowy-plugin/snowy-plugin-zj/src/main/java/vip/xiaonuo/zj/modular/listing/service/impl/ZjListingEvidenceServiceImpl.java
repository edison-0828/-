package vip.xiaonuo.zj.modular.listing.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vip.xiaonuo.auth.core.util.StpClientUtil;
import vip.xiaonuo.common.exception.CommonException;
import vip.xiaonuo.zj.modular.listing.entity.ZjListing;
import vip.xiaonuo.zj.modular.listing.entity.ZjListingEvidence;
import vip.xiaonuo.zj.modular.listing.mapper.ZjListingEvidenceMapper;
import vip.xiaonuo.zj.modular.listing.param.ZjListingEvidenceSubmitParam;
import vip.xiaonuo.zj.modular.listing.service.ZjListingEvidenceService;
import vip.xiaonuo.zj.modular.listing.service.ZjListingService;

import java.util.Collections;
import java.util.List;

@Service
public class ZjListingEvidenceServiceImpl extends ServiceImpl<ZjListingEvidenceMapper, ZjListingEvidence>
        implements ZjListingEvidenceService {

    @Resource
    private ZjListingService listingService;

    @Transactional(rollbackFor = Exception.class)
    @Override
    public void submit(ZjListingEvidenceSubmitParam param) {
        assertOwner(param.getListingId());
        this.remove(new LambdaQueryWrapper<ZjListingEvidence>().eq(ZjListingEvidence::getListingId, param.getListingId()));
        saveFiles(param.getListingId(), "CONTRACT", param.getContractUrls());
        saveFiles(param.getListingId(), "RENT_PROOF",
                param.getRentProofUrls() == null ? Collections.emptyList() : param.getRentProofUrls());
    }

    @Override
    public List<ZjListingEvidence> mine(String listingId) {
        assertOwner(listingId);
        return this.list(new LambdaQueryWrapper<ZjListingEvidence>()
                .eq(ZjListingEvidence::getListingId, listingId).orderByAsc(ZjListingEvidence::getCreateTime));
    }

    private void saveFiles(String listingId, String type, List<String> urls) {
        urls.forEach(url -> {
            ZjListingEvidence evidence = new ZjListingEvidence();
            evidence.setListingId(listingId);
            evidence.setEvidenceType(type);
            evidence.setFileUrl(url);
            evidence.setReviewStatus("PENDING_REVIEW");
            this.save(evidence);
        });
    }

    private void assertOwner(String listingId) {
        ZjListing listing = listingService.getById(listingId);
        if (listing == null) throw new CommonException("房源不存在");
        if (!StpClientUtil.getLoginIdAsString().equals(listing.getPublisherId())) {
            throw new CommonException("无权操作该房源的证明材料");
        }
    }
}
