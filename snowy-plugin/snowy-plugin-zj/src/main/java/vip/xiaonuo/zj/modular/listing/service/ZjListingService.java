package vip.xiaonuo.zj.modular.listing.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import vip.xiaonuo.zj.modular.listing.entity.ZjListing;
import vip.xiaonuo.zj.modular.listing.param.ZjListingCreateParam;
import vip.xiaonuo.zj.modular.listing.param.ZjListingQueryParam;
import vip.xiaonuo.zj.modular.listing.param.ZjListingReviewParam;

import java.util.List;

public interface ZjListingService extends IService<ZjListing> {
    Page<ZjListing> publicPage(ZjListingQueryParam param);
    ZjListing publicDetail(String id);
    String create(ZjListingCreateParam param);
    List<ZjListing> myListings();
    List<ZjListing> publishedByIds(List<String> ids);
    void review(ZjListingReviewParam param);
}
