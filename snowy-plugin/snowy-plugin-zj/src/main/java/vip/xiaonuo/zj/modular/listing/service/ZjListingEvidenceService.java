package vip.xiaonuo.zj.modular.listing.service;

import com.baomidou.mybatisplus.extension.service.IService;
import vip.xiaonuo.zj.modular.listing.entity.ZjListingEvidence;
import vip.xiaonuo.zj.modular.listing.param.ZjListingEvidenceSubmitParam;

import java.util.List;

public interface ZjListingEvidenceService extends IService<ZjListingEvidence> {
    void submit(ZjListingEvidenceSubmitParam param);
    List<ZjListingEvidence> mine(String listingId);
}
